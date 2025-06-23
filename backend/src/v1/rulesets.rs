use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
};

use axum_extra::extract::cookie::CookieJar;

use crate::errors::{WebError, new_web_error};
use crate::state;
use state::{auth::auth_or_error, ruleset};

use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::engine::core::interpreter::{config, example_config};
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

pub fn hardcoded_rulesets() -> Vec<RulesetDescriber> {
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

pub async fn get_rulesets() -> Json<Vec<RulesetDescriber>> {
    Json(hardcoded_rulesets())
}

pub async fn ruleset_id_get(Path(ruleset_id): Path<u64>) -> impl IntoResponse {
    if ruleset_id != 101 {
        return Err(StatusCode::NOT_FOUND);
    } else {
        return Ok(Json(example_config::gen_example_config()));
    }
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct RulesetResult {
    ruleset_id: String,
}

pub async fn create_ruleset(
    State(state): State<state::app::AppState>,
    jar: CookieJar,
) -> Result<Json<RulesetResult>, WebError> {
    let session = auth_or_error(state.clone(), jar).await?;
    let config = serde_json::to_string(&config::GameConfig::blank()).map_err(|_e| {
        new_web_error(StatusCode::INTERNAL_SERVER_ERROR, "Couldn't serialize json")
    })?;

    let ruleset_id = ruleset::create_ruleset(
        state.clone(),
        &config,
        0,
        None,
        "New Game",
        "My new game",
        &session.player_id,
    )
    .await
    .map_err(|_e| new_web_error(StatusCode::INTERNAL_SERVER_ERROR, "Couldn't add ruleset"))?;

    Ok(Json(RulesetResult {
        ruleset_id: ruleset_id.to_string(),
    }))
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct RulesetInfo {
    config: config::GameConfig,
    title: String,
    description: String,
}

pub async fn edit_ruleset(
    Path(ruleset_id): Path<uuid::Uuid>,
    State(state): State<state::app::AppState>,
    jar: CookieJar,
    Json(req): Json<RulesetInfo>,
) -> Result<Json<RulesetResult>, WebError> {
    let session = auth_or_error(state.clone(), jar).await?;
    let owner_id = ruleset::ruleset_get_owner(state.clone(), &ruleset_id)
        .await
        .map_err(|_e| new_web_error(StatusCode::BAD_REQUEST, "ruleset doesn't exist"))?;

    let config = serde_json::to_string(&req.config).map_err(|_e| {
        new_web_error(StatusCode::INTERNAL_SERVER_ERROR, "Couldn't serialize json")
    })?;
    if owner_id == session.player_id {
        ruleset::update_ruleset(state, &ruleset_id, &config, &req.title, &req.description)
            .await
            .map_err(|_e| {
                new_web_error(StatusCode::INTERNAL_SERVER_ERROR, "Couldn't update ruleset")
            })?;
        return Ok(Json(RulesetResult {
            ruleset_id: ruleset_id.to_string(),
        }));
    } else {
        let new_id = ruleset::create_ruleset(
            state,
            &config,
            0,
            Some(&ruleset_id),
            &req.title,
            &req.description,
            &session.player_id,
        )
        .await
        .map_err(|_e| {
            new_web_error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Couldn't create new ruleset",
            )
        })?;
        return Ok(Json(RulesetResult {
            ruleset_id: new_id.to_string(),
        }));
    }
}

#[instrument]
#[axum::debug_handler]
// Spawn a game task and associate it with a code
pub async fn create_game(
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
