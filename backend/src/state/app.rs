use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

use rand::Rng;

use super::engine_wrapper::interface::WebgameRequest;
use super::web::WebGame;
use tokio::sync::mpsc;
use tracing::{error, info};

pub type GameTx = mpsc::UnboundedSender<WebgameRequest>;
pub type RoomMap = Arc<Mutex<HashMap<u64, GameTx>>>;

use sqlx::PgPool;

#[derive(Clone, Debug)]
pub struct AppState {
    pub rooms: RoomMap,
    pub db: PgPool,
}

impl AppState {
    // Generates a random room, starting it and returning it's associated code
    #[tracing::instrument]
    pub fn start_room(&self) -> Result<u64, String> {
        info!("Attempting to lock rooms mutex");

        let room_id = random_code();
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

    pub fn has_room(&self, room_id: u64) -> bool {
        let room_map = self.rooms.lock().unwrap();
        room_map.contains_key(&room_id)
    }
}

fn random_code() -> u64 {
    let mut rng = rand::rng();
    rng.random_range(0..1000000)
}
