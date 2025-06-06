use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

use super::{game, player};
use serde::{Deserialize, Serialize};

use tokio::sync::mpsc;
use tracing::{error, info};

#[derive(Clone, Debug)]
enum WebGameConnection {
    Connected(mpsc::UnboundedSender<game::GameSnapshot>),
    Disconnected(u64),
}

#[derive(Clone, Debug)]
struct WebGamePlayer {
    nickname: String,
    conn: WebGameConnection,
}

impl WebGamePlayer {
    fn to_pinfo(&self) -> player::PlayerInformation {
        player::PlayerInformation {
            nickname: self.nickname.clone(),
            disconnected: match self.conn {
                WebGameConnection::Connected(_) => None,
                WebGameConnection::Disconnected(elapsed) => Some(elapsed),
            },
        }
    }
}

pub struct WebgameJoin {
    pub nickname: Option<String>,
    pub tx: mpsc::UnboundedSender<game::GameSnapshot>,
}

pub enum WebgameRequestType {
    Join(WebgameJoin),
    Disconnect,
    GameCommand(game::GameCommand),
}

pub struct WebgameRequest {
    pub request_type: WebgameRequestType,
    pub player_id: player::PlayerId,
}

//
#[derive(Debug, Clone)]
struct WebGameState {
    pub connections: HashMap<player::PlayerId, WebGamePlayer>,
    // Underlying engine will only care about order, it won't know
    // about player IDs or such
    pub player_order: Vec<player::PlayerId>,
    pub status: game::GameStatus,
}

impl WebGameState {
    pub fn snapshot(&self) -> game::GameSnapshot {
        game::GameSnapshot {
            actions: None,
            private_actions: None,
            status: self.status.clone(),

            players: Some(player::PlayerSnapshot {
                players: self
                    .connections
                    .iter()
                    .map(|(pid, pdata)| (pid.clone(), pdata.to_pinfo()))
                    .collect(),
                order: self.player_order.clone(),
            }),
        }
    }

    #[tracing::instrument]
    pub fn broadcast(
        &mut self,
        private_actions: Option<HashMap<player::PlayerId, Vec<game::GameAction>>>,
    ) {
        let public = self.snapshot();
        let mut invalid: Vec<player::PlayerId> = Vec::new();

        for (player_id, player) in &mut self.connections {
            if let WebGameConnection::Connected(tx) = player.conn.clone() {
                let copy = game::GameSnapshot {
                    private_actions: match &private_actions {
                        Some(p_actions) => p_actions.get(player_id).cloned(),
                        None => None,
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
        let mut join_ack: HashMap<player::PlayerId, Vec<game::GameAction>> = HashMap::new();
        join_ack.insert(
            player_id.clone(),
            vec![game::GameAction::JoinResult(Ok(player_id.clone()))],
        );
        self.broadcast(Some(join_ack));
    }

    // Remove a connection if previously set
    fn disconnect_player(&mut self, player_id: &player::PlayerId) {
        if let Some(player) = self.connections.get_mut(player_id) {
            //Disconnect player
            if let WebGameConnection::Connected(_) = player.conn {
                player.conn = WebGameConnection::Disconnected(0);
            }

            //See if it's safe to delete the player

            let index = self.player_order.iter().position(|n| n == player_id);
            if let Some(idx) = index {
                if let game::GameStatus::Waiting = self.status {
                    self.player_order.remove(idx);
                    self.connections.remove(player_id);
                }
            } else {
                self.connections.remove(player_id);
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
            match msg.request_type {
                WebgameRequestType::Join(_) => (),
                WebgameRequestType::Disconnect => self.disconnect_and_broadcast(&msg.player_id),
                _ => (), //Todo, implement
            }
        }
    }

    // Checks if player exists or is trying to Join
    // If a player is trying to join: add the player to active connections
    // If a player id is found in list of active connections, return True
    fn process_player_exists_or_joining(&mut self, msg: &WebgameRequest) -> bool {
        match &msg.request_type {
            WebgameRequestType::Join(request) => {
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
                                let mut error = game::GameSnapshot::new();
                                error.add_private_action(game::GameAction::JoinResult(Err(
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
                    if let game::GameStatus::Waiting = self.status {
                        self.player_order.push(msg.player_id.clone());
                    }
                    self.connections.insert(
                        msg.player_id.clone(),
                        WebGamePlayer {
                            nickname: match &request.nickname {
                                Some(nick) => nick.clone(),
                                //TODO: Add some sort of random nickname generator
                                None => "Anonymous Player".into(),
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

#[derive(Debug)]
pub struct WebGame {
    state: Mutex<WebGameState>,
    rx: mpsc::UnboundedReceiver<WebgameRequest>,
}

impl WebGame {
    pub fn new() -> (Self, mpsc::UnboundedSender<WebgameRequest>) {
        let (tx, rx) = mpsc::unbounded_channel::<WebgameRequest>();

        let state = WebGameState {
            connections: HashMap::new(),
            player_order: Vec::new(),
            status: game::GameStatus::Waiting,
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
        loop {
            tokio::select! {
                Some(msg) = self.rx.recv() => {
                    info!("Processing a player request");

                    let mut state = self.state.lock().unwrap();
                    state.process_request(&msg);
                }
            }
        }
    }
}
