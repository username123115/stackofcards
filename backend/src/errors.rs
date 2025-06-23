use axum::{Json, http::StatusCode};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct ErrorDetail {
    pub error: String,
}

pub type WebError = (StatusCode, Json<ErrorDetail>);

pub fn new_web_error(status: StatusCode, message: &str) -> WebError {
    tracing::error!("New error occured with reason {message}");
    (
        status,
        Json(ErrorDetail {
            error: message.to_string(),
        }),
    )
}
