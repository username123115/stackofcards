use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

use tokio::sync::mpsc;

pub type RoomMap = Arc<Mutex<HashMap<u64, GameRoom>>>;
pub type PlayerId = String;

#[derive(Clone)]
pub struct AppState {
    pub rooms: RoomMap,
}

pub struct GameRoom {
    pub room_number: u64,
    pub tx: mpsc::Sender<PlayerAction>,
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
}

pub struct GameState {
    connections: HashMap<PlayerId, PlayerInformation>,
}

pub enum PlayerAction {
    Join(PlayerInformation),
    Heartbeat,
}

pub enum GameAction {
    SetCards,
    Layout,
    CurrentPlayers,
    Private,
    Heartbeat,
}

/* pub struct ActiveGame {
    pub connections : Vec<
} */

impl GameRoom {
    pub async fn start_room(rooms: RoomMap) -> Result<u64, String> {
        let room_id = random_number();
        let mut room_map = rooms.lock().unwrap();

        if room_map.contains_key(&room_id) {
            return Result::Err(String::from("Failed to get available room"));
        }
        let (tx, mut rx) = mpsc::channel::<PlayerAction>(32);
        let new_room = GameRoom {
            room_number: room_id,
            tx,
        };

        room_map.insert(room_id, new_room);
        Result::Ok(room_id)
    }

    pub async fn game_loop(mut rx: mpsc::Receiver<PlayerAction>) {
        while let Some(msg) = rx.recv().await {
            //Do stuff here
        }
    }
}

fn random_number() -> u64 {
    4
}
