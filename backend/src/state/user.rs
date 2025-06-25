use crate::state::app::AppState;
use anyhow;
use chrono::{DateTime, Utc};
use sqlx;
use uuid::Uuid;

pub struct User {
    pub user_id: Uuid,
    pub username: String,
    pub password_hash: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
}

pub async fn get_user(state: AppState, user_id: &Uuid) -> anyhow::Result<User> {
    let user = sqlx::query_as!(User, r#"select * from "user" where user_id=$1"#, user_id)
        .fetch_one(&state.db)
        .await?;
    Ok(user)
}
