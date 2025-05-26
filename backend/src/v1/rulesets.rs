use axum::{Json, http::StatusCode, response::IntoResponse};

use serde::{Deserialize, Serialize};
use ts_rs::TS;

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
    let examples: [RulesetDescriber; 5] = [
        RulesetDescriber {
            name: String::from("Go Fish"),
            description: String::from("Simple matching card game."),
            identifier: 101,
        },
        RulesetDescriber {
            name: String::from("Poker"),
            description: String::from("Betting and strategy card game."),
            identifier: 102,
        },
        RulesetDescriber {
            name: String::from("Blackjack"),
            description: String::from("Aim for 21 without going over."),
            identifier: 103,
        },
        RulesetDescriber {
            name: String::from("Solitaire"),
            description: String::from("Single-player card game."),
            identifier: 104,
        },
        RulesetDescriber {
            name: String::from("Bridge"),
            description: String::from("Partnership trick-taking card game."),
            identifier: 105,
        },
    ];
    Vec::from(examples)
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct GameInfo {
    pub code: u32,
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct GameCreateRequest {
    pub id: RulesetIdentifier,
}

pub async fn get() -> Json<Vec<RulesetDescriber>> {
    Json(get_rulesets())
}
/*
curl -X POST localhost:5173/v1/rulesets \
-H "Content-Type: application/json" \
-d '{"id": 100}' \
-i
*/

#[instrument]
#[axum::debug_handler]
pub async fn post(Json(game): Json<GameCreateRequest>) -> Result<Json<GameInfo>, StatusCode> {
    info!("Game requested");
    if (game.id != 101) {
        return Err(StatusCode::NOT_FOUND);
    }
    let new_game = GameInfo { code: 123456 };
    Ok(Json(new_game))
}
