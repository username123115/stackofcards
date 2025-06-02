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

async fn join(
    room: u64,
    ws: WebSocketUpgrade,
    State(state): State<state::AppState>,
) -> impl IntoResponse {
    String::from("todo")
}

//async fn handle_create_websocket(

fn random_number() -> u64 {
    4
}
