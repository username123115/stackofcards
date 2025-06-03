use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};

use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::state;
use tracing::{info, instrument};

pub async fn id_get(State(state): State<state::AppState>, game_code: u64) -> impl IntoResponse {}
