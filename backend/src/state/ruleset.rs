use crate::state::app::AppState;
use anyhow;
use chrono::{DateTime, Utc};
use sqlx;
use uuid::Uuid;

pub struct Ruleset {
    pub ruleset_id: Uuid,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,

    pub config: String,
    pub config_version: i32,

    pub based_on: Option<Uuid>,
    pub owner: Uuid,

    pub description: String,
    pub published: bool,
    pub title: String,
}

pub async fn create_ruleset(
    state: AppState,
    config: &str,
    version: i32,
    based_on: Option<&Uuid>,
    title: &str,
    description: &str,
    owner: &Uuid,
) -> anyhow::Result<Uuid> {
    let ruleset_id = sqlx::query_scalar!(
        r#"insert into "ruleset" (config, config_version, based_on, owner, title, description) values ($1, $2, $3, $4, $5, $6) returning ruleset_id"#,
        config.to_string(), version, based_on.cloned(), owner.clone(), title.to_string(), description.to_string()
    ).fetch_one(&state.db).await?;
    Ok(ruleset_id)
}

pub async fn update_ruleset(
    state: AppState,
    ruleset_id: &Uuid,
    new_config: &str,
    title: &str,
    description: &str,
) -> anyhow::Result<()> {
    sqlx::query!(
        r#"
        update "ruleset"
        set config = $1, title = $2, description = $3
        where ruleset_id = $4
        "#,
        new_config,
        title.to_string(),
        description.to_string(),
        ruleset_id.clone(),
    )
    .execute(&state.db)
    .await?;

    Ok(())
}

pub async fn get_ruleset(state: AppState, ruleset_id: &Uuid) -> anyhow::Result<Ruleset> {
    let result = sqlx::query_as!(
        Ruleset,
        r#"
        select * from "ruleset" where ruleset_id=$1 
        "#,
        ruleset_id.clone(),
    )
    .fetch_one(&state.db)
    .await?;
    Ok(result)
}

pub async fn get_rulesets_by_owner(
    state: AppState,
    owner: &Uuid,
    limit: i64,
    offset: i64,
) -> anyhow::Result<Vec<Ruleset>> {
    let result = sqlx::query_as!(
        Ruleset,
        r#"
        select ruleset_id, created_at, updated_at, config, config_version, based_on, owner, description, published, title
        from "ruleset"
        where owner = $1
        order by created_at desc
        limit $2 offset $3
        "#,
        owner.clone(),
        limit,
        offset,
    )
    .fetch_all(&state.db)
    .await?;
    Ok(result)
}

pub async fn get_rulesets_by_time(
    state: AppState,
    limit: i64,
    offset: i64,
) -> anyhow::Result<Vec<Ruleset>> {
    let result = sqlx::query_as!(
        Ruleset,
        r#"
        select ruleset_id, created_at, updated_at, config, config_version, based_on, owner, description, published, title
        from "ruleset"
        order by coalesce(updated_at, created_at) desc
        limit $1 offset $2
        "#,
        limit,
        offset,
    )
    .fetch_all(&state.db)
    .await?;
    Ok(result)
}
