use axum::{
    Json,
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
};

use tracing::{info, instrument};

use crate::errors::{WebError, new_web_error};
use crate::state;
use state::{auth::auth_or_error, ruleset};

use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct Pagination {
    page: usize,
    per_page: usize,
}

pub async fn rulesets_owned_by(
    State(state): State<state::app::AppState>,
    Path(player_id): Path<uuid::Uuid>,
    pagination: Query<Pagination>,
) -> Result<(), WebError> {
    let offset = pagination.page * pagination.per_page;
    let results = state::ruleset::get_rulesets_by_owner(
        state.clone(),
        &player_id,
        pagination.per_page.try_into().map_err(|_e| {
            new_web_error(StatusCode::INTERNAL_SERVER_ERROR, "page size too large")
        })?,
        offset
            .try_into()
            .map_err(|_e| new_web_error(StatusCode::INTERNAL_SERVER_ERROR, "offset too large"))?,
    )
    .await
    .map_err(|_e| new_web_error(StatusCode::BAD_REQUEST, "nonexistant player"))?;
    Ok(())
}
