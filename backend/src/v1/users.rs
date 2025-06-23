use crate::errors::{WebError, new_web_error};
use crate::state;

use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use axum_extra::extract::cookie::{Cookie, CookieJar};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use anyhow::Context;
use argon2::password_hash::{SaltString, rand_core::OsRng};
use argon2::{Argon2, PasswordHash};

use std::fmt;

use state::auth::{create_session, get_session};

#[derive(TS, Serialize, Deserialize, Debug)]
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

impl fmt::Debug for NewUser {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("NewUser")
            .field("username", &self.password)
            .finish()
    }
}

#[derive(TS, Serialize, Deserialize)]
#[ts(export)]
pub struct LoginUser {
    pub username: String,
    pub password: String,
}

impl fmt::Debug for LoginUser {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("LoginUser")
            .field("username", &self.password)
            .finish()
    }
}

#[derive(TS, Serialize, Deserialize, Debug)]
#[ts(export)]
pub struct UserInfo {
    pub username: String,
    pub user_id: String,
}

#[axum::debug_handler]
#[tracing::instrument]
pub async fn create_user(
    jar: CookieJar,
    State(state): State<state::app::AppState>,
    Json(req): Json<UserBody<NewUser>>,
) -> Result<(CookieJar, Json<UserBody<UserInfo>>), WebError> {
    tracing::info!("New request to create user");
    if !req.user.username.chars().all(char::is_alphanumeric) {
        return Err(new_web_error(
            StatusCode::BAD_REQUEST,
            "Alphanumeric name field only",
        ));
    }
    if req.user.username.len() < 3 {
        return Err(new_web_error(
            StatusCode::BAD_REQUEST,
            "username not long enough",
        ));
    }
    if req.user.password.len() < 8 {
        return Err(new_web_error(
            StatusCode::BAD_REQUEST,
            "Password should be > 8 characters",
        ));
    }

    let password_hash = hash_password(req.user.password)
        .await
        .map_err(|_e| new_web_error(StatusCode::INTERNAL_SERVER_ERROR, "couldn't hash password"))?;

    let user_id = sqlx::query_scalar!(
        r#"insert into "user" (username, password_hash) values ($1, $2) returning user_id"#,
        req.user.username,
        password_hash,
    )
    .fetch_one(&state.db)
    .await
    .map_err(|_e| new_web_error(StatusCode::CONFLICT, "Username already exists"))?;

    let session = create_session(state.clone(), user_id).await.map_err(|_e| {
        new_web_error(
            StatusCode::INTERNAL_SERVER_ERROR,
            "User created, but failed to acquire session",
        )
    })?;
    tracing::info!("New user created");
    Ok((
        jar.add(
            Cookie::build(("socs_session_id", session.session_id.to_string()))
                .path("/")
                .secure(true)
                .http_only(true),
        ),
        Json(UserBody {
            user: UserInfo {
                username: req.user.username,
                user_id: session.session_id.to_string(),
            },
        }),
    ))
}

#[tracing::instrument]
pub async fn login_user(
    jar: CookieJar,
    State(state): State<state::app::AppState>,
    Json(req): Json<UserBody<LoginUser>>,
) -> Result<(CookieJar, Json<UserBody<UserInfo>>), WebError> {
    let user = state::auth::get_user_by_name(state.clone(), req.user.username.clone())
        .await
        .map_err(|_e| new_web_error(StatusCode::BAD_REQUEST, "user doesn't exist"))?;

    verify_password(req.user.password.clone(), user.password_hash)
        .await
        .map_err(|_e| new_web_error(StatusCode::UNAUTHORIZED, "couldn't verify password"))?;

    let session = create_session(state.clone(), user.user_id)
        .await
        .map_err(|_e| {
            new_web_error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to create session",
            )
        })?;
    Ok((
        jar.add(
            Cookie::build(("socs_session_id", session.session_id.to_string()))
                .path("/")
                .secure(true)
                .http_only(true),
        ),
        Json(UserBody {
            user: UserInfo {
                username: user.username,
                user_id: session.session_id.to_string(),
            },
        }),
    ))
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
