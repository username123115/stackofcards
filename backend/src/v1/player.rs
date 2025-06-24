use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
};

use tracing::{info, instrument};

use crate::errors::{WebError, new_web_error};
use crate::state;
use state::{auth::auth_or_error, ruleset};

pub async fn cards_owned_by(Path(player_id): Path<uuid::Uuid>) {}
