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

use tokio::sync::mpsc;

use crate::state;

#[tokio::main]

async fn create(State(state): State<state::AppState>) -> impl IntoResponse {
    let rooms = state.rooms.clone();
    let (tx, mut rx) = mpsc::channel::<String>(32);

    let room_id = random_number();
    {
        let mut room_map = rooms.lock().unwrap();

        //erm what the skibidi how did my random number generator fail???
        if room_map.contains_key(&room_id) {
            return Result::Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    }

    tokio::spawn(async move { game_task(room_id, rooms) });

    Result::Ok(Json(room_id))

    //TODO: Check for existance
}

async fn game_task(room_number: u64, rooms: state::RoomMap) {}

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
