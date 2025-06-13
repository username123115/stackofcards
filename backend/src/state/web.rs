use crate::engine::core::interpreter;
use std::{
    collections::{HashMap, VecDeque},
    sync::Mutex,
};

use super::{game_wrapper, names, player};
use game_wrapper as wrapper;

use tokio::sync::mpsc;
use tracing::info;

#[derive(Debug)]
pub struct WebGame {
    state: Mutex<WebGameState>,
    rx: mpsc::UnboundedReceiver<WebgameRequest>,
}

#[derive(Debug, Clone)]
struct WebGameState {
    pub connections: HashMap<player::PlayerId, WebGamePlayer>,
    // Underlying engine will only care about order, it won't know
    // about player IDs or such
    pub player_order: Vec<player::PlayerId>,
    pub public_action_queue: VecDeque<wrapper::GameAction>,
    pub game: interpreter::game::Game,
    pub status: InterpreterStatus,
}

#[derive(Clone, Debug)]
enum WebGameConnection {
    Connected(mpsc::UnboundedSender<wrapper::GameSnapshot>),
    Disconnected(u64),
}

#[derive(Clone, Debug)]
struct WebGamePlayer {
    nickname: String,
    conn: WebGameConnection,
}

impl WebGamePlayer {
    fn to_pinfo(&self, role: Option<player::PlayerRole>) -> player::PlayerInformation {
        player::PlayerInformation {
            nickname: self.nickname.clone(),
            disconnected: match self.conn {
                WebGameConnection::Connected(_) => None,
                WebGameConnection::Disconnected(elapsed) => Some(elapsed),
            },
            role,
        }
    }
}

pub struct WebgameJoin {
    pub nickname: Option<String>,
    pub tx: mpsc::UnboundedSender<wrapper::GameSnapshot>,
}

pub enum WebgameRequestBody {
    Join(WebgameJoin),
    Disconnect,
    PlayerCommand(wrapper::PlayerCommand),
}

pub struct WebgameRequest {
    pub body: WebgameRequestBody,
    pub player_id: player::PlayerId,
}

#[derive(Clone, Debug)]
pub enum InterpreterStatus {
    Setup,                 //Initial state as a game loads
    PendingExecution,      //Some instructions need to be executed
    InstructionDelay(u64), //Delay some seconds (Spawn a task to decr each second)
    Blocked,               //Waiting on some external input from players
    Failed,                // Fatal error / crash
}

impl WebGameState {
    pub fn get_player_snapshot(&self) -> player::PlayerSnapshot {
        let mut psnapshot = player::PlayerSnapshot {
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
            let role = player::PlayerRole {
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
    pub fn get_snapshot(&mut self) -> wrapper::GameSnapshot {
        wrapper::GameSnapshot {
            actions: self.public_action_queue.drain(..).collect(),
            private_actions: Vec::new(),
            status: self.game.get_status(),
            players: Some(self.get_player_snapshot()),
        }
    }

    pub fn queue_chat(&mut self, from: Option<&player::PlayerId>, msg: &str) {
        self.public_action_queue
            .push_back(wrapper::GameAction::ChatMsg(wrapper::GameChat {
                from: from.cloned(),
                contents: msg.to_string(),
            }))
    }

    #[tracing::instrument]
    pub fn broadcast(
        &mut self,
        private_actions: Option<HashMap<player::PlayerId, Vec<wrapper::GameAction>>>,
    ) {
        let public = self.get_snapshot();
        let mut invalid: Vec<player::PlayerId> = Vec::new();

        for (player_id, player) in &mut self.connections {
            if let WebGameConnection::Connected(tx) = player.conn.clone() {
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

    fn broadcast_join_acc(&mut self, player_id: &player::PlayerId) {
        let mut join_ack: HashMap<player::PlayerId, Vec<wrapper::GameAction>> = HashMap::new();
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
    fn disconnect_player(&mut self, player_id: &player::PlayerId) {
        let mut nick: Option<String> = None;
        if let Some(player) = self.connections.get_mut(player_id) {
            nick = Some(player.nickname.clone());
            //Disconnect player
            if let WebGameConnection::Connected(_) = player.conn {
                player.conn = WebGameConnection::Disconnected(0);
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

    fn disconnect_and_broadcast(&mut self, player_id: &player::PlayerId) {
        self.disconnect_player(player_id);
        self.broadcast(None);
    }

    // If this function blocks I'm going to crash out
    pub fn process_request(&mut self, msg: &WebgameRequest) {
        if self.process_player_exists_or_joining(msg) {
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
                                    Ok(_) => (),
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
    fn process_player_exists_or_joining(&mut self, msg: &WebgameRequest) -> bool {
        match &msg.body {
            WebgameRequestBody::Join(request) => {
                let tx = request.tx.clone();

                // Previously added player try reconnecting them unless they already have a
                // connection somehow
                if let Some(player) = self.connections.get_mut(&msg.player_id) {
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
                        WebGamePlayer {
                            nickname: match &request.nickname {
                                Some(nick) => nick.clone(),
                                //TODO: Add some sort of random nickname generator
                                None => names::make_random_name(),
                            },
                            conn: WebGameConnection::Connected(tx),
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

impl WebGame {
    pub fn new() -> (Self, mpsc::UnboundedSender<WebgameRequest>) {
        let (tx, rx) = mpsc::unbounded_channel::<WebgameRequest>();

        let state = WebGameState {
            connections: HashMap::new(),
            player_order: Vec::new(),
            public_action_queue: VecDeque::new(),
            game: interpreter::game::Game::new(interpreter::example_config::gen_example_config()),
            status: InterpreterStatus::Setup,
        };

        (
            Self {
                state: Mutex::new(state),
                rx: rx,
            },
            tx,
        )
    }

    #[tracing::instrument]
    pub async fn run(mut self) {
        info!("Starting game");
        while true {
            tokio::select! {
                Some(msg) = self.rx.recv() => {
                    info!("Processing a player request");

                    let mut state = self.state.lock().unwrap();
                    state.process_request(&msg);
                }
            }
        }

        {
            let mut state = self.state.lock().unwrap();
            state.queue_chat(None, "Game is no longer running");
            state.broadcast(None);
        }
    }
}
