use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
};

use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::state::AppState;
use tracing::{info, instrument};

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct RoomExistance {
    exists: bool,
}

pub async fn game_code_get(
    State(state): State<AppState>,
    Path(game_code): Path<u64>,
) -> impl IntoResponse {
    Json(RoomExistance {
        exists: state.has_room(game_code),
    })
}
