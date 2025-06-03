use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

use serde::{Deserialize, Serialize};

use tokio::sync::mpsc;
use tracing::{error, info};

pub type GameTx = mpsc::UnboundedSender<PlayerRequest>;
pub type RoomMap = Arc<Mutex<HashMap<u64, GameTx>>>;
pub type PlayerId = String;

#[derive(Clone, Debug)]
pub struct AppState {
    pub rooms: RoomMap,
}

#[derive(Clone, Debug)]
pub struct PlayerConnection {
    pub info: PlayerInformation,
    pub tx: mpsc::UnboundedSender<GameFeedback>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PlayerInformation {
    pub nickname: String,
    pub player_id: PlayerId,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub enum GameAction {
    SetCards,
    Layout,
    Private,
    JoinResult(Result<(), String>),
}

#[derive(Debug, Copy, Clone, Serialize, Deserialize)] // Added Copy, Clone
pub enum GameStatus {
    Waiting,
    Started,
    Invalid,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct GameFeedback {
    pub actions: Option<Vec<GameAction>>,
    pub private_actions: Option<Vec<GameAction>>,
    pub players: Option<GamePlayers>,
    pub status: GameStatus,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct GamePlayers {
    pub players: Vec<PlayerInformation>,
    pub order: Vec<PlayerId>,
}

impl GameFeedback {
    pub fn from_state(state: &WebGameState) -> Self {
        Self {
            actions: None,
            private_actions: None,
            status: state.status.clone(),

            players: Some(GamePlayers {
                players: state
                    .connections
                    .iter()
                    .map(|(_, v)| v.info.clone())
                    .collect(),
                order: state.player_order.clone(),
            }),
        }
    }

    pub fn new() -> Self {
        Self {
            actions: None,
            private_actions: None,
            players: None,
            status: GameStatus::Invalid,
        }
    }

    pub fn add_action(&mut self, action: GameAction) {
        if let Some(actions) = &mut self.actions {
            actions.push(action);
        } else {
            self.private_actions = Some(vec![action]);
        }
    }

    pub fn add_private_action(&mut self, action: GameAction) {
        if let Some(actions) = &mut self.private_actions {
            actions.push(action);
        } else {
            self.private_actions = Some(vec![action]);
        }
    }
}

#[derive(Debug, Clone)]
struct WebGameState {
    connections: HashMap<PlayerId, PlayerConnection>,
    // Underlying engine will only care about order, it won't know
    // about player IDs or such
    player_order: Vec<PlayerId>,
    status: GameStatus,
}

pub enum PlayerRequestType {
    Join(PlayerConnection),
    Update,
    Disconnect,
    Heartbeat,
}

pub struct PlayerRequest {
    request_type: PlayerRequestType,
    player_id: PlayerId,
}

impl WebGameState {
    #[tracing::instrument]
    pub fn broadcast_private(&mut self, actions: HashMap<PlayerId, Vec<GameAction>>) {
        let public = GameFeedback::from_state(&self);

        for (player_id, player) in &mut self.connections {
            let copy = GameFeedback {
                private_actions: actions.get(player_id).cloned(),
                ..public.clone()
            };
            if let Err(e) = player.tx.send(copy) {
                info!("Broadcast to closed channel!, panicking! {e}");
                panic!("Broadcast to closed channel!, panicking! {e}");
            }
        }
    }

    // If this function blocks I'm going to crash out
    pub fn process_request(&mut self, msg: &PlayerRequest) {
        if self.process_player_exists_or_joining(msg) {
            match msg.request_type {
                PlayerRequestType::Join(_) => (),
                _ => (), //Todo, implement
            }
        }
    }

    // Checks if player exists or is trying to Join
    // If a player is trying to join: add the player to active connections
    // If a player id is found in list of active connections, return True
    fn process_player_exists_or_joining(&mut self, msg: &PlayerRequest) -> bool {
        match &msg.request_type {
            PlayerRequestType::Join(connection) => {
                // -- Basic Sanity checks
                let tx = connection.tx.clone();
                if connection.info.player_id != msg.player_id {
                    let mut error = GameFeedback::new();
                    error.add_private_action(GameAction::JoinResult(Err("ID's mismatch".into())));

                    tx.send(error).unwrap_or(()); //Ignore result if unable to send
                    return false;
                }
                if self.connections.contains_key(&connection.info.player_id) {
                    let mut error = GameFeedback::new();
                    error.add_private_action(GameAction::JoinResult(Err(
                        "ID already exists".into()
                    )));
                    tx.send(error).unwrap_or(());
                    return false;
                }

                // Add player to connections and broadcast addition, additionally informing newly
                // added player of success
                //TODO: More fine grained join logic
                if let GameStatus::Waiting = self.status {
                    self.player_order.push(connection.info.player_id.clone());
                }
                self.connections
                    .insert(connection.info.player_id.clone(), connection.clone());

                let mut join_ack: HashMap<PlayerId, Vec<GameAction>> = HashMap::new();
                join_ack.insert(
                    connection.info.player_id.clone(),
                    vec![GameAction::JoinResult(Ok(()))],
                );
                self.broadcast_private(join_ack);

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
    rx: mpsc::UnboundedReceiver<PlayerRequest>,
}

impl WebGame {
    pub fn new() -> (Self, mpsc::UnboundedSender<PlayerRequest>) {
        let (tx, rx) = mpsc::unbounded_channel::<PlayerRequest>();

        let state = WebGameState {
            connections: HashMap::new(),
            player_order: Vec::new(),
            status: GameStatus::Waiting,
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

impl AppState {
    // Generates a random room, starting it and returning it's associated code
    #[tracing::instrument]
    pub fn start_room(&self) -> Result<u64, String> {
        info!("Attempting to lock rooms mutex");

        let room_id = random_number();
        let mut room_map = self.rooms.lock().unwrap();

        info!("Room access obtained");

        // Probably retry multiple different times before failing
        if room_map.contains_key(&room_id) {
            error!("Failed allocating ID to a new room");
            return Result::Err(String::from("Failed to get available room"));
        }

        let (game, tx) = WebGame::new();
        room_map.insert(room_id, tx);
        drop(room_map);

        tokio::spawn(game.run());
        info!("Room ready, spawned with id {room_id}");
        Result::Ok(room_id)
    }
}

fn random_number() -> u64 {
    4
}
