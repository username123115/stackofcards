use crate::state::auth;
use axum::{Json, http::StatusCode};
use serde::{Deserialize, Serialize};

use crate::state::app::AppState;
use axum_extra::extract::cookie::CookieJar;

#[derive(Serialize, Deserialize, Debug)]
pub struct ErrorDetail {
    pub error: String,
}

pub type WebError = (StatusCode, Json<ErrorDetail>);

pub fn new_web_error(status: StatusCode, message: &str) -> WebError {
    (
        status,
        Json(ErrorDetail {
            error: message.to_string(),
        }),
    )
}

pub async fn auth_or_error(state: AppState, jar: CookieJar) -> Result<auth::UserSession, WebError> {
    match auth::user_auth(state, jar).await {
        Ok(s) => Ok(s),
        Err(_) => Err(new_web_error(StatusCode::FORBIDDEN, "not logged in")),
    }
}
