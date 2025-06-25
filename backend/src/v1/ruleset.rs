use axum::{
    Json,
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
};

use axum_extra::extract::cookie::CookieJar;

use super::schema::{common, ruleset_schema::*};
use crate::errors::{WebError, new_web_error};
use crate::state;
use state::{auth::auth_or_error, ruleset};

use crate::engine::core::interpreter::config;
use tracing::{info, instrument};

pub fn rulesets_to_listing(rulesets: Vec<ruleset::Ruleset>) -> Vec<RulesetPreview> {
    rulesets
        .iter()
        .map(|rs| RulesetPreview {
            title: rs.title.clone(),
            description: rs.description.clone(),
            author_id: rs.owner.to_string(),
            author_name: rs.owner_name.clone(),
            based_on: match rs.based_on {
                Some(pid) => Some(pid.to_string()),
                None => None,
            },
            ruleset_id: rs.ruleset_id.to_string(),
        })
        .collect()
}

pub async fn get_rulesets(
    State(state): State<state::app::AppState>,
    pagination: Query<common::Pagination>,
) -> Result<Json<RulesetListing>, WebError> {
    let count = ruleset::count_rulesets(state.clone()).await.map_err(|_e| {
        new_web_error(
            StatusCode::INTERNAL_SERVER_ERROR,
            "couldn't get ruleset count",
        )
    })?;
    let rulesets = ruleset::get_rulesets(
        state.clone(),
        pagination.per_page,
        pagination.page * pagination.per_page,
    )
    .await
    .map_err(|_e| new_web_error(StatusCode::INTERNAL_SERVER_ERROR, "Error fetching page"))?;
    //TODO: idk how to extract the query pagination thing
    Ok(Json(RulesetListing {
        total: count,
        pagination: common::Pagination {
            page: pagination.page,
            per_page: pagination.per_page,
        },
        contents: rulesets_to_listing(rulesets),
    }))
}

pub async fn get_ruleset(
    State(state): State<state::app::AppState>,
    Path(ruleset_id): Path<uuid::Uuid>,
) -> Result<Json<RulesetContents>, WebError> {
    let rs = ruleset::get_ruleset(state, &ruleset_id)
        .await
        .map_err(|_e| new_web_error(StatusCode::BAD_REQUEST, "Not found"))?;
    let config: config::GameConfig = serde_json::from_str(&rs.config)
        .map_err(|_e| new_web_error(StatusCode::INTERNAL_SERVER_ERROR, "Config is unreadable"))?;

    Ok(Json(RulesetContents {
        title: rs.title.to_string(),
        description: rs.description.to_string(),
        config: config,
    }))
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

pub async fn edit_ruleset(
    Path(ruleset_id): Path<uuid::Uuid>,
    State(state): State<state::app::AppState>,
    jar: CookieJar,
    Json(req): Json<RulesetContents>,
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
