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
