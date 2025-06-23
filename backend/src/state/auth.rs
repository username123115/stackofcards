use crate::errors::{WebError, new_web_error};
use crate::state::app::AppState;

use anyhow;
use chrono::{DateTime, Duration, Utc};
use sqlx;
use uuid::Uuid;

use axum::http::StatusCode;
use axum_extra::extract::cookie::CookieJar;

pub struct UserSession {
    pub created_at: DateTime<Utc>,
    pub expires: DateTime<Utc>,
    pub session_id: uuid::Uuid,
    pub player_id: uuid::Uuid,
}

pub struct User {
    pub user_id: Uuid,
    pub username: String,
    pub password_hash: String,
}

pub async fn create_session(state: AppState, player_id: uuid::Uuid) -> anyhow::Result<UserSession> {
    let created_at: DateTime<Utc> = Utc::now();
    let expires: DateTime<Utc> = created_at + Duration::days(30);
    let session_id = sqlx::query_scalar!(
        r#"insert into "sessions" (reference, created_at, expires) values ($1, $2, $3) returning "session""#,
        player_id,
        created_at,
        expires
    ).fetch_one(&state.db).await?;
    Ok(UserSession {
        created_at,
        expires,
        session_id,
        player_id,
    })
}

pub async fn get_session(state: AppState, session_id: uuid::Uuid) -> anyhow::Result<UserSession> {
    let current_time: DateTime<Utc> = Utc::now();
    let session = sqlx::query_as!(
        UserSession,
        r#" 
        select
            created_at,
            expires,
            session as "session_id!",
            reference as "player_id!"
        from sessions
        where session = $1
        "#,
        session_id
    )
    .fetch_one(&state.db)
    .await?;
    if current_time > session.expires {
        return Err(anyhow::anyhow!("Session expired"));
    }
    Ok(session)
}

pub async fn get_user_by_name(state: AppState, name: String) -> anyhow::Result<User> {
    let user = sqlx::query_as!(
        User,
        r#"
        select
            user_id,
            username,
            password_hash
        from "user"
        where username = $1
        "#,
        name
    )
    .fetch_one(&state.db)
    .await?;
    Ok(user)
}

pub async fn user_auth(state: AppState, jar: CookieJar) -> anyhow::Result<UserSession> {
    if let Some(token) = jar.get("socs_session_id") {
        let uid = Uuid::parse_str(token.value())?;
        let session = get_session(state, uid).await?;
        return Ok(session);
    }
    Err(anyhow::anyhow!("No login token"))
}

pub async fn auth_or_error(state: AppState, jar: CookieJar) -> Result<UserSession, WebError> {
    match user_auth(state, jar).await {
        Ok(s) => Ok(s),
        Err(_) => Err(new_web_error(StatusCode::FORBIDDEN, "not logged in")),
    }
}
