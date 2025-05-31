use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

use tokio::sync::mpsc;

pub type GameTx = mpsc::UnboundedSender<PlayerRequest>;

pub type RoomMap = Arc<Mutex<HashMap<u64, GameTx>>>;
pub type PlayerId = String;

pub type GameTx = mpsc::UnboundedSender<PlayerRequest>;
pub type RoomMap = Arc<Mutex<HashMap<u64, GameTx>>>;
pub type PlayerId = String;

#[derive(Clone)]
pub struct AppState {
    pub rooms: RoomMap,
}

#[derive(Clone, Debug)]
pub enum PlayerRole {
    Spectating,
    Playing(u64),
}

#[derive(Clone, Debug)]
pub struct PlayerInformation {
    pub role: PlayerRole,
    pub nickname: String,
    pub player_id: PlayerId,
    pub tx: mpsc::UnboundedSender<GameAction>,
}

#[derive(Debug, Clone)] // Added Clone as it might be needed for broadcasting
pub enum GameAction {
    SetCards,
    Layout,
    CurrentPlayers,
    Private,
    JoinResult(Result<(), String>),
    TimerTick(u64), // Added a GameAction to notify players about the timer
                    // Add other game-specific actions here
}

#[derive(Debug, Copy, Clone)] // Added Copy, Clone
pub enum GameStatus {
    Waiting,
    Started,
}

struct WebGameState {
    connections: HashMap<PlayerId, PlayerInformation>,
    player_order: Vec<PlayerId>,
    status: GameStatus,
}

impl WebGameState {
    pub fn process_request(&mut self, msg: &PlayerRequest) {
        if self.process_player_exists_or_joining(msg) {
            match msg {
                _ => (), //Todo, implement
            }
        }
    }

    fn process_player_exists_or_joining(&mut self, msg: &PlayerRequest) -> bool {
        match &msg.request_type {
            PlayerRequestType::Join(info) => {
                // -- Basic Sanity checks
                let tx = info.tx.clone();
                if info.player_id != msg.player_id {
                    tx.send(GameAction::JoinResult(Err(String::from(
                        "IDs are mismatched",
                    ))))
                    .unwrap_or(()); //Ignore result if unable to send
                    return false;
                }
                if self.connections.contains_key(&info.player_id) {
                    tx.send(GameAction::JoinResult(Err(String::from(
                        "ID already exists",
                    ))))
                    .unwrap_or(());
                    return false;
                }
                // -- Add player to existing connections
                //
                let player_role: PlayerRole = match self.status {
                    //TODO: Game specific logic here
                    GameStatus::Waiting => {
                        PlayerRole::Playing(self.player_order.len().try_into().unwrap())
                    }

                    GameStatus::Started => PlayerRole::Spectating,
                };
                let mut new_info = info.clone();
                new_info.role = player_role;
                self.connections
                    .insert(new_info.player_id.clone(), new_info.clone());
                return true;
            }
            _ => (),
        }
        self.connections.contains_key(&msg.player_id)
    }
}

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

    pub async fn run(mut self) {
        loop {
            tokio::select! {
                Some(msg) = self.rx.recv() => {
                    let mut state = self.state.lock().unwrap();
                    state.process_request(&msg);
                }
            }
        }
    }
}

pub enum PlayerRequestType {
    Join(PlayerInformation),
    Update,
    Disconnect,
    Heartbeat,
}

pub struct PlayerRequest {
    request_type: PlayerRequestType,
    player_id: PlayerId,
}

/* pub struct ActiveGame {
    pub connections : Vec<
} */

pub async fn start_room(rooms: RoomMap) -> Result<u64, String> {
    let room_id = random_number();
    let mut room_map = rooms.lock().unwrap();

    // Probably retry multiple different times before failing
    if room_map.contains_key(&room_id) {
        return Result::Err(String::from("Failed to get available room"));
    }

    let (game, tx) = WebGame::new();

    room_map.insert(room_id, tx);
    Result::Ok(room_id)
}

fn random_number() -> u64 {
    4
}
