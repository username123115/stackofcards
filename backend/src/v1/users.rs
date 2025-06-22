use crate::state;
use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use rand;
use serde;

use anyhow::Context;

use argon2::password_hash::{SaltString, rand_core::OsRng};
use argon2::{Argon2, PasswordHash};

#[derive(serde::Deserialize, serde::Serialize)]
struct UserBody<T> {
    user: T,
}

#[derive(serde::Deserialize)]
struct NewUser {
    username: String,
    password: String,
}

#[derive(serde::Deserialize)]
struct LoginUser {
    username: String,
    password: String,
}

#[derive(serde::Deserialize)]
struct User {
    token: String,
    username: String,
}

async fn create_user(
    State(state): State<state::app::AppState>,
    Json(req): Json<UserBody<NewUser>>,
) -> impl IntoResponse {
}

async fn hash_password(password: String) -> anyhow::Result<String> {
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

async fn verify_password(password: String, password_hash: String) -> anyhow::Result<()> {
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
