use std::{
    collections::HashMap,
    net::SocketAddr,
    sync::{Arc, Mutex},
};

use uuid::Uuid;

use axum::{
    Json,
    extract::{State, WebSocketUpgrade, ws::WebSocket},
    http::StatusCode,
    response::IntoResponse,
};

use crate::state;
use tokio::sync::mpsc;
use tracing::{info, instrument};

async fn join_handler(
    room: u64,
    ws: WebSocketUpgrade,
    State(state): State<state::app::AppState>,
) -> impl IntoResponse {
    let rooms_map = state.rooms.lock().unwrap();
    let game_tx_option = rooms_map.get(&room).cloned();
    // Drop lock
    drop(rooms_map);

    if let Some(game_tx) = game_tx_option {
        info!("Room {room} found, upgrading connection");
    }
}

pub struct WebgameClient {
    pub ws: WebSocket,
    pub tx: mpsc::UnboundedSender<state::web::WebgameRequest>,
    pub rx: mpsc::UnboundedReceiver<state::game::GameSnapshot>,
    pub uuid: Uuid,
}

impl WebgameClient {
    pub fn join(
        ws: WebSocket,
        tx: mpsc::UnboundedSender<state::web::WebgameRequest>,
    ) -> Result<Self, String> {
        //TODO: W/db UUID can be gleaned from a user
        let uuid = Uuid::new_v4();

        let (tx_self, mut rx) = mpsc::unbounded_channel::<state::game::GameSnapshot>();
        let new_client = Self {
            ws,
            tx: tx.clone(),
            rx,
            uuid,
        };

        let join_request = state::web::WebgameRequest {
            request_type: state::web::WebgameRequestType::Join(state::web::WebGamePlayer {
                info: state::player::PlayerInformation {
                    nickname: "TODO".into(),
                    player_id: uuid.into(),
                },
                tx: tx_self,
            }),
            player_id: uuid.into(),
        };

        if let Err(_) = tx.send(join_request) {
            return Err("Couldn't contact game".into());
        }

        Ok(new_client)
    }
}
