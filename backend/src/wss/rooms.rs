use std::{
    collections::HashMap,
    net::SocketAddr,
    sync::{Arc, Mutex},
};

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
    pub rx: mpsc::UnboundedReceiver<state::game::GameAction>,
}

impl WebgameClient {
    pub fn join(
        ws: WebSocket,
        tx: mpsc::UnboundedReceiver<state::web::WebgameRequest>,
    ) -> Result<Self, String> {
        Err("Unimplemented".into())
    }
}
