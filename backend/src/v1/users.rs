use crate::errors::{WebError, new_web_error};
use crate::state;

use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use axum_extra::extract::cookie::{Cookie, CookieJar};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use anyhow::Context;
use argon2::password_hash::{SaltString, rand_core::OsRng};
use argon2::{Argon2, PasswordHash};

use state::auth::{create_session, get_session};

#[derive(TS, Serialize, Deserialize)]
#[ts(export)]
pub struct UserBody<T> {
    user: T,
}

#[derive(TS, Serialize, Deserialize)]
#[ts(export)]
pub struct NewUser {
    pub username: String,
    pub password: String,
}

#[derive(TS, Serialize, Deserialize)]
#[ts(export)]
pub struct LoginUser {
    pub username: String,
    pub password: String,
}

#[derive(TS, Serialize, Deserialize)]
#[ts(export)]
pub struct User {
    pub username: String,
}

//TODO: Check against whitespace
#[axum::debug_handler]
pub async fn create_user(
    jar: CookieJar,
    State(state): State<state::app::AppState>,
    Json(req): Json<UserBody<NewUser>>,
) -> Result<CookieJar, WebError> {
    if !req.user.username.chars().all(char::is_alphanumeric) {
        return Err(new_web_error(
            StatusCode::BAD_REQUEST,
            "Alphanumeric name field only",
        ));
    }
    if req.user.password.len() < 8 {
        return Err(new_web_error(
            StatusCode::BAD_REQUEST,
            "Password should be > 8 characters",
        ));
    }

    let password_hash = hash_password(req.user.password).await?;
    let user_id = sqlx::query_scalar!(
        r#"insert into "user" (username, password_hash) values ($1, $2) returning user_id"#,
        req.user.username,
        password_hash,
    )
    .fetch_one(&state.db)
    .await
    .unwrap_or(Err(new_web_error(
        StatusCode::INTERNAL_SERVER_ERROR,
        "Unable to create user",
    )));

    let session = create_session(state, user_id)
        .await
        .context("User created, but failed to acquire session")?;
    Ok(jar
        .add(
            Cookie::build(("socs_session_id", session.session_id.to_string()))
                .path("/")
                .secure(true)
                .http_only(true),
        )
        .add(Cookie::build((
            "socs_player_id",
            session.player_id.to_string(),
        ))))
}

pub async fn hash_password(password: String) -> anyhow::Result<String> {
    // Argon2 hashing is designed to be computationally intensive,
    // so we need to do this on a blocking thread.
    Ok(
        tokio::task::spawn_blocking(move || -> anyhow::Result<String> {
            let salt = SaltString::generate(&mut OsRng);
            Ok(PasswordHash::generate(Argon2::default(), password, &salt)
                .map_err(|e| anyhow::anyhow!("failed to generate password hash: {}", e))?
                .to_string())
        })
        .await
        .context("panic in generating password hash")??,
    )
}

pub async fn verify_password(password: String, password_hash: String) -> anyhow::Result<()> {
    Ok(tokio::task::spawn_blocking(move || -> anyhow::Result<()> {
        let hash = PasswordHash::new(&password_hash)
            .map_err(|e| anyhow::anyhow!("invalid password hash: {}", e))?;

        hash.verify_password(&[&Argon2::default()], password)
            .map_err(|e| match e {
                argon2::password_hash::Error::Password => anyhow::anyhow!("unauthorized"),
                _ => anyhow::anyhow!("failed to verify password hash: {}", e).into(),
            })
    })
    .await
    .context("panic in verifying password hash")??)
}
