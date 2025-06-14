use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
};

use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::engine::core::interpreter::example_config;
use crate::state;
use tracing::{info, instrument};

pub type RulesetIdentifier = u64;

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct RulesetDescriber {
    pub name: String,
    pub description: String,
    pub identifier: RulesetIdentifier,
}

//TODO: Pending the DSL becoming complete, a Rust implementation of Go Fish will be used regardless
//of game

pub fn get_rulesets() -> Vec<RulesetDescriber> {
    let examples: [RulesetDescriber; 1] = [RulesetDescriber {
        name: String::from("Demonstration"),
        description: String::from(
            "The engine is WIP, this game is for prototyping and demonstrating engine capabilities",
        ),
        identifier: 101,
    }];
    Vec::from(examples)
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct GameInfo {
    pub code: u64,
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct GameCreateRequest {
    pub id: RulesetIdentifier,
}

/*
curl -X POST localhost:5173/v1/rulesets \
-H "Content-Type: application/json" \
-d '{"id": 100}' \
-i
*/

pub async fn get() -> Json<Vec<RulesetDescriber>> {
    Json(get_rulesets())
}

pub async fn ruleset_id_get(Path(ruleset_id): Path<u64>) -> impl IntoResponse {
    if ruleset_id != 101 {
        return Err(StatusCode::NOT_FOUND);
    } else {
        return Ok(Json(example_config::gen_example_config()));
    }
}

#[instrument]
#[axum::debug_handler]
// Spawn a game task and associate it with a code
pub async fn post(
    State(state): State<state::app::AppState>,
    Json(game): Json<GameCreateRequest>,
) -> impl IntoResponse {
    info!("Game requested");

    //TODO: Custom games
    if game.id != 101 {
        return Err(StatusCode::NOT_FOUND);
    }

    let code = state.start_room();
    match code {
        Ok(room_id) => {
            let new_game = GameInfo { code: room_id };
            return Ok(Json(new_game));
        }
        Err(_) => return Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}
