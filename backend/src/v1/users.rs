use crate::state;
use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use axum_extra::extract::cookie::{Cookie, CookieJar};
use rand;
use serde;

use anyhow::Context;
use argon2::password_hash::{SaltString, rand_core::OsRng};
use argon2::{Argon2, PasswordHash};

use state::auth::{create_session, get_session};

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
    username: String,
}

//TODO: Check against whitespace
async fn create_user(
    State(state): State<state::app::AppState>,
    Json(req): Json<UserBody<NewUser>>,
    jar: CookieJar,
) -> anyhow::Result<(CookieJar)> {
    if (!req.user.username.chars().all(char::is_alphanumeric)) {
        return Err(anyhow::anyhow!("Alphanumeric name field only"));
    }
    if (req.user.password.len() < 8) {
        return Err(anyhow::anyhow!("Password should be > 8 characters"));
    }

    let password_hash = hash_password(req.user.password).await?;
    let user_id = sqlx::query_scalar!(
        r#"insert into "user" (username, password_hash) values ($1, $2) returning user_id"#,
        req.user.username,
        password_hash,
    )
    .fetch_one(&state.db)
    .await?;

    let session = create_session(state, user_id)
        .await
        .context("User created, but failed to acquire session")?;
    Ok(jar.add(
        Cookie::build(("socs_session_id", session.session_id.to_string()))
            .path("/")
            .secure(true)
            .http_only(true),
    ))
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
