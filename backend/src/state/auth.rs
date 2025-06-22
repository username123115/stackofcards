use crate::state::app::AppState;
use anyhow;
use axum_login::{AuthUser, AuthnBackend, UserId};
use chrono::{DateTime, Duration, Utc};
use serde;
use sqlx;
use uuid::Uuid;

pub struct UserSession {
    pub created_at: DateTime<Utc>,
    pub expires: DateTime<Utc>,
    pub session_id: uuid::Uuid,
    pub player_id: uuid::Uuid,
}

async fn create_session(state: AppState, player_id: uuid::Uuid) -> anyhow::Result<UserSession> {
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

async fn get_session(state: AppState, session_id: uuid::Uuid) -> anyhow::Result<UserSession> {
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
    Ok(session)
}
