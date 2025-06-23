use crate::{engine::core::interpreter::config, state::app::AppState};
use anyhow;
use chrono::{DateTime, Utc};
use sqlx;
use uuid::Uuid;

pub struct Session {
    ruleset_id: Uuid,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,

    config: String,
    version: i64,

    based_on: Option<Uuid>,
    owner: Uuid,
}
