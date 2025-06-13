use crate::engine::core::interpreter;
use std::collections::{HashMap, VecDeque};

use super::{connections, interface, names, status::InterpreterStatus, wrapper};

use tracing::info;

#[derive(Debug, Clone)]
pub struct WebGameState {
    pub connections: HashMap<wrapper::PlayerId, connections::WebGamePlayer>,
    // Underlying engine will only care about order, it won't know
    // about player IDs or such
    pub player_order: Vec<wrapper::PlayerId>,
    pub public_action_queue: VecDeque<wrapper::GameAction>,
    pub game: interpreter::game::Game,
    pub status: InterpreterStatus,
}

impl WebGameState {
    pub fn get_player_snapshot(&self) -> wrapper::PlayerSnapshot {
        let mut psnapshot = wrapper::PlayerSnapshot {
            players: self
                .connections
                .iter()
                .map(|(pid, pdata)| (pid.clone(), pdata.to_pinfo(None)))
                .collect(),
            order: self.player_order.clone(),
        };

        let roles = self.game.get_roles();
        for (idx, pid) in self.player_order.iter().enumerate() {
            if idx >= roles.len() {
                break;
            }
            let role = wrapper::PlayerRole {
                order: idx as u64,
                role: roles[idx].clone(),
            };
            if let Some(player) = psnapshot.players.get_mut(pid) {
                player.role = Some(role);
            } else {
                tracing::error!("Player order vector contains nonexistant player ID {pid}");
            }
        }
        psnapshot
    }
    fn get_snapshot(&mut self) -> wrapper::GameSnapshot {
        wrapper::GameSnapshot {
            actions: self.public_action_queue.drain(..).collect(),
            private_actions: Vec::new(),
            status: self.game.get_status(),
            players: Some(self.get_player_snapshot()),
        }
    }

    pub fn is_crashed(&self) -> bool {
        if let InterpreterStatus::Failed = self.status {
            return true;
        }
        false
    }

    pub fn queue_chat(&mut self, from: Option<&wrapper::PlayerId>, msg: &str) {
        self.public_action_queue
            .push_back(wrapper::GameAction::ChatMsg(wrapper::GameChat {
                from: from.cloned(),
                contents: msg.to_string(),
            }))
    }

    #[tracing::instrument]
    pub fn broadcast(
        &mut self,
        private_actions: Option<HashMap<wrapper::PlayerId, Vec<wrapper::GameAction>>>,
    ) {
        let public = self.get_snapshot();
        let mut invalid: Vec<wrapper::PlayerId> = Vec::new();

        for (player_id, player) in &mut self.connections {
            if let connections::WebGameConnection::Connected(tx) = player.conn.clone() {
                let copy = wrapper::GameSnapshot {
                    private_actions: match &private_actions {
                        Some(p_actions) => p_actions.get(player_id).cloned().unwrap_or(Vec::new()),
                        None => Vec::new(),
                    },
                    ..public.clone()
                };
                if let Err(e) = tx.send(copy) {
                    info!("Broadcast to closed channel!, removing player! {e}");
                    //TODO: This shouldn't happen at all and results in annoying behaviors if it
                    //does, maybe panic instead? The Client associated with this tx should
                    //initiate a disconnect before dropping the receiver
                    //There's actually a race condition now that I think about it where the
                    //disconnect hasn't reached us but the client has already dropped
                    invalid.push(player_id.clone())
                }
            }
        }

        for player_id in invalid.iter() {
            self.disconnect_player(player_id);
        }
    }

    fn broadcast_join_acc(&mut self, player_id: &wrapper::PlayerId) {
        let mut join_ack: HashMap<wrapper::PlayerId, Vec<wrapper::GameAction>> = HashMap::new();
        join_ack.insert(
            player_id.clone(),
            vec![wrapper::GameAction::JoinResult(Ok(player_id.clone()))],
        );
        let nick_option = self.connections.get(player_id);
        if let Some(p_info) = nick_option {
            self.queue_chat(None, &format!("{} has joined", p_info.nickname));
            self.broadcast(Some(join_ack));
        }
    }

    // Remove a connection if previously set
    fn disconnect_player(&mut self, player_id: &wrapper::PlayerId) {
        let mut nick: Option<String> = None;
        if let Some(player) = self.connections.get_mut(player_id) {
            nick = Some(player.nickname.clone());
            //Disconnect player
            if let connections::WebGameConnection::Connected(_) = player.conn {
                player.conn = connections::WebGameConnection::Disconnected(0);
            }

            //See if it's safe to delete the player

            let index = self.player_order.iter().position(|n| n == player_id);
            if let Some(idx) = index {
                if self.game.is_waiting() {
                    self.player_order.remove(idx);
                    self.connections.remove(player_id);
                    self.update_player_roles();
                }
            } else {
                self.connections.remove(player_id);
            }
        }
        if let Some(n) = nick {
            self.queue_chat(None, &format!("{} Disconnected", n));
        }
    }

    fn update_player_roles(&mut self) {
        if self.game.is_waiting() {
            tracing::info!("Assigning player roles");
            match self.game.update_players(self.player_order.len() as u64) {
                Ok(_) => (),
                Err(msg) => {
                    //TODO: error broadcast to clients
                    tracing::error!("Couldn't update players: {msg}");
                }
            }
        }
    }

    fn disconnect_and_broadcast(&mut self, player_id: &wrapper::PlayerId) {
        self.disconnect_player(player_id);
        self.broadcast(None);
    }

    // If this function blocks I'm going to crash out
    pub fn process_request(&mut self, msg: &interface::WebgameRequest) {
        if self.process_player_exists_or_joining(msg) {
            use interface::WebgameRequestBody;
            match &msg.body {
                WebgameRequestBody::Join(_) => (),
                WebgameRequestBody::Disconnect => self.disconnect_and_broadcast(&msg.player_id),
                WebgameRequestBody::PlayerCommand(pcmd) => {
                    use wrapper::PlayerCommand;
                    match pcmd {
                        PlayerCommand::SendMsg(chat_string) => {
                            self.queue_chat(Some(&msg.player_id), chat_string);
                            self.broadcast(None);
                        }
                        PlayerCommand::StartGame => {
                            if self.game.is_ready()
                                && self.player_order.len() > 0
                                && msg.player_id == self.player_order[0]
                            {
                                self.queue_chat(None, "Starting game");
                                self.broadcast(None);

                                use interpreter::game::GameError;
                                match self.game.init() {
                                    Ok(_) => {
                                        self.broadcast(None);
                                        self.status = InterpreterStatus::PendingExecution;
                                    }
                                    Err(gerror) => {
                                        match gerror {
                                            GameError::Recoverable(_) => (), //TODO, in the future log
                                            GameError::Fatal(e) => {
                                                self.queue_chat(None, &format!("FATAL: {:?}", e));
                                                self.broadcast(None);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                _ => (), //TODO
            }
        }
    }

    // Checks if player exists or is trying to Join
    // If a player is trying to join: add the player to active connections
    // If a player id is found in list of active connections, return True
    fn process_player_exists_or_joining(&mut self, msg: &interface::WebgameRequest) -> bool {
        use interface::WebgameRequestBody;
        match &msg.body {
            WebgameRequestBody::Join(request) => {
                let tx = request.tx.clone();

                // Previously added player try reconnecting them unless they already have a
                // connection somehow
                if let Some(player) = self.connections.get_mut(&msg.player_id) {
                    use connections::WebGameConnection;
                    match player.conn.clone() {
                        WebGameConnection::Connected(original_tx) => {
                            if original_tx.is_closed() {
                                tracing::warn!(
                                    "Player is able to rejoin, but only because TX was not properly cleaned"
                                );
                                player.conn = WebGameConnection::Connected(tx);
                                self.broadcast_join_acc(&msg.player_id);
                                return true;
                            } else {
                                let mut error = wrapper::GameSnapshot::new();
                                error.add_private_action(wrapper::GameAction::JoinResult(Err(
                                    "ID already exists".into(),
                                )));
                                tx.send(error).unwrap_or(());
                                return false;
                            }
                        }
                        WebGameConnection::Disconnected(_) => {
                            player.conn = WebGameConnection::Connected(tx);
                            self.broadcast_join_acc(&msg.player_id);
                            return true;
                        }
                    }
                } else {
                    // Add player to connections and broadcast addition, additionally informing newly
                    // added player of success
                    //TODO: More fine grained join logic
                    if self.game.is_waiting() {
                        self.player_order.push(msg.player_id.clone());
                        self.update_player_roles();
                    }
                    self.connections.insert(
                        msg.player_id.clone(),
                        connections::WebGamePlayer {
                            nickname: match &request.nickname {
                                Some(nick) => nick.clone(),
                                //TODO: Add some sort of random nickname generator
                                None => names::make_random_name(),
                            },
                            conn: connections::WebGameConnection::Connected(tx),
                        },
                    );

                    self.broadcast_join_acc(&msg.player_id);
                    return true;
                }
            }
            _ => (),
        }
        self.connections.contains_key(&msg.player_id)
    }
}
