use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

use tokio::sync::mpsc;

pub type GameTx = mpsc::UnboundedSender<PlayerRequest>;

pub type RoomMap = Arc<Mutex<HashMap<u64, GameTx>>>;
pub type PlayerId = String;

#[derive(Clone)]
pub struct AppState {
    pub rooms: RoomMap,
}

pub enum PlayerRole {
    Spectating,
    Playing(u64), //Current player order
}

pub struct PlayerInformation {
    role: PlayerRole,
    nickname: String,
    player_id: PlayerId,
    last_heartbeat: u64,
    tx: mpsc::UnboundedSender<GameAction>,
}

pub enum GameAction {
    SetCards,
    Layout,
    CurrentPlayers,
    Private,
    Heartbeat,
    JoinResult(Result<(), String>),
}

pub enum GameState {
    Waiting,
    Started,
}

pub struct WebGame {
    connections: HashMap<PlayerId, PlayerInformation>,
    player_order: Vec<PlayerId>,
    state: GameState,

    rx: mpsc::UnboundedReceiver<PlayerRequest>,
}

impl WebGame {
    pub async fn play(mut self) {
        while let Some(mut msg) = self.rx.recv().await {
            // Target joining players

            if self.player_exists_or_joining(&mut msg) {
                continue;
            }

            let pending_player = self.connections.get(&msg.player_id);

            match msg.request_type {
                PlayerRequestType::Join(_) => (), // Joining is already handled
                _ => (),
            }
        }
    }

    pub fn player_exists_or_joining(&mut self, msg: &mut PlayerRequest) -> bool {
        match &mut msg.request_type {
            PlayerRequestType::Join(info) => {
                let tx = info.tx.clone();
                if info.player_id != msg.player_id {
                    tx.send(GameAction::JoinResult(Result::Err(String::from(
                        "IDs are mismatched",
                    ))));
                }
            }
            _ => (),
        }
        true
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

    let (tx, mut rx) = mpsc::unbounded_channel::<PlayerRequest>();

    room_map.insert(room_id, tx);
    Result::Ok(room_id)
}

impl WebGame {}

pub async fn game_loop(mut rx: mpsc::UnboundedReceiver<PlayerRequest>) {
    while let Some(msg) = rx.recv().await {
        //Do stuff here
        match msg.request_type {
            PlayerRequestType::Join(_) => (),
            _ => (),
        }
    }
}

fn random_number() -> u64 {
    4
}
