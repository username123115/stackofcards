use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
};

use super::schema::game_schema::*;
use crate::engine::core::interpreter::config;
use crate::errors::{WebError, new_web_error};

use crate::state;
use state::app::AppState;

pub async fn game_code_get(
    State(state): State<AppState>,
    Path(game_code): Path<u64>,
) -> impl IntoResponse {
    Json(RoomExistance {
        exists: state.has_room(game_code),
    })
}

pub async fn start_game(
    State(state): State<AppState>,
    Json(req): Json<NewGame>,
) -> Result<Json<GameInfo>, WebError> {
    let ruleset_id = uuid::Uuid::parse_str(&req.ruleset_id)
        .map_err(|_e| new_web_error(StatusCode::BAD_REQUEST, "string is not a UUID"))?;
    let rs = state::ruleset::get_ruleset(state.clone(), &ruleset_id)
        .await
        .map_err(|_e| new_web_error(StatusCode::BAD_REQUEST, "ruleset not found"))?;

    let config: config::GameConfig = serde_json::from_str(&rs.config)
        .map_err(|_e| new_web_error(StatusCode::INTERNAL_SERVER_ERROR, "Corrupted config"))?;

    let code = state
        .start_room(&config)
        .map_err(|_e| new_web_error(StatusCode::INTERNAL_SERVER_ERROR, "Unable to start game"))?;

    let ginfo = GameInfo { code: code as u32 };

    Ok(Json(ginfo))
}
