use axum::{Json, http::StatusCode};
pub struct ErrorDetail {
    pub error: String,
}

pub struct Error {
    pub status: StatusCode,
    pub error: Json<ErrorDetail>,
}

impl Error {
    pub fn new(status: StatusCode, details: &str) -> Self {
        Self {
            status,
            error: Json(ErrorDetail {
                error: details.to_string(),
            }),
        }
    }
}
