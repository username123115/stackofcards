use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

use super::{game, player};
use serde::{Deserialize, Serialize};

use tokio::sync::mpsc;
use tracing::{error, info};

#[derive(Clone, Debug)]
pub struct WebGamePlayer {
    pub info: player::PlayerInformation,
    pub tx: mpsc::UnboundedSender<game::GameSnapshot>,
}

pub enum WebgameRequestType {
    Join(WebGamePlayer),
    Update,
    Disconnect,
    Heartbeat,
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
                    .map(|(_, v)| v.info.clone())
                    .collect(),
                order: self.player_order.clone(),
            }),
        }
    }

    #[tracing::instrument]
    pub fn broadcast(&mut self, private_actions: HashMap<player::PlayerId, Vec<game::GameAction>>) {
        let public = self.snapshot();

        for (player_id, player) in &mut self.connections {
            let copy = game::GameSnapshot {
                private_actions: private_actions.get(player_id).cloned(),
                ..public.clone()
            };
            if let Err(e) = player.tx.send(copy) {
                info!("Broadcast to closed channel!, panicking! {e}");
                panic!("Broadcast to closed channel!, panicking! {e}");
            }
        }
    }

    // If this function blocks I'm going to crash out
    pub fn process_request(&mut self, msg: &WebgameRequest) {
        if self.process_player_exists_or_joining(msg) {
            match msg.request_type {
                WebgameRequestType::Join(_) => (),
                _ => (), //Todo, implement
            }
        }
    }

    // Checks if player exists or is trying to Join
    // If a player is trying to join: add the player to active connections
    // If a player id is found in list of active connections, return True
    fn process_player_exists_or_joining(&mut self, msg: &WebgameRequest) -> bool {
        match &msg.request_type {
            WebgameRequestType::Join(connection) => {
                // -- Basic Sanity checks
                let tx = connection.tx.clone();
                if connection.info.player_id != msg.player_id {
                    let mut error = game::GameSnapshot::new();
                    error.add_private_action(game::GameAction::JoinResult(Err(
                        "ID's mismatch".into()
                    )));

                    tx.send(error).unwrap_or(()); //Ignore result if unable to send
                    return false;
                }
                if self.connections.contains_key(&connection.info.player_id) {
                    let mut error = game::GameSnapshot::new();
                    error.add_private_action(game::GameAction::JoinResult(Err(
                        "ID already exists".into(),
                    )));
                    tx.send(error).unwrap_or(());
                    return false;
                }

                // Add player to connections and broadcast addition, additionally informing newly
                // added player of success
                //TODO: More fine grained join logic
                if let game::GameStatus::Waiting = self.status {
                    self.player_order.push(connection.info.player_id.clone());
                }
                self.connections
                    .insert(connection.info.player_id.clone(), connection.clone());

                let mut join_ack: HashMap<player::PlayerId, Vec<game::GameAction>> = HashMap::new();
                join_ack.insert(
                    connection.info.player_id.clone(),
                    vec![game::GameAction::JoinResult(Ok(()))],
                );
                self.broadcast(join_ack);

                return true;
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
