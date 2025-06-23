use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

use axum::{
    Router,
    routing::{get, post},
};
use sqlx::postgres::PgPoolOptions;

use backend::{state::app::AppState, v1, wss};

use tracing::info;
use tracing_subscriber;

// Room needs a list of players

#[tokio::main]
#[tracing::instrument]
async fn main() {
    tracing_subscriber::fmt::init();

    let config = backend::config::Config::from_env();

    info!("Creating new sql pool");
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&config.database_url)
        .await
        .unwrap();

    let state = AppState {
        rooms: Arc::new(Mutex::new(HashMap::new())),
        db: pool,
    };

    let app = Router::new()
        .route("/v1/hello", get(hello))
        .route("/v1/test", get(v1::object_test::handler))
        .route("/v1/rulesets", get(v1::rulesets::get))
        .route("/v1/rulesets", post(v1::rulesets::post))
        .route(
            "/v1/rulesets/{ruleset_id}",
            get(v1::rulesets::ruleset_id_get),
        )
        .route("/v1/games/{game_code}", get(v1::games::game_code_get))
        .route("/v1/rooms/{room}", get(wss::rooms::join_handler)) //wss upgrade
        .route("/v1/signup", post(v1::users::create_user))
        .route("/v1/login", post(v1::users::login_user))
        .with_state(state);

    info!("Binding port");
    let listener = tokio::net::TcpListener::bind("0.0.0.0:5050").await.unwrap();
    info!("Listening on {}", listener.local_addr().unwrap());

    info!("Starting SoCs");

    axum::serve(listener, app).await.unwrap();
}

async fn hello() -> &'static str {
    "Hello, world!"
}
