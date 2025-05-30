use std::{
    collections::HashMap,
    net::SocketAddr,
    sync::{Arc, Mutex},
};

use axum::{
    Router,
    response::Html,
    routing::{get, post},
    serve,
};
use sqlx::postgres::PgPoolOptions;

use backend::{state::AppState, v1, wss};

use tracing::{Level, event, info};
use tracing_subscriber;

// Room needs a list of players

#[tokio::main]
#[tracing::instrument]
async fn main() {
    tracing_subscriber::fmt::init();

    let state = AppState {
        rooms: Arc::new(Mutex::new(HashMap::new())),
    };

    let app = Router::new()
        .route("/v1/hello", get(hello))
        .route("/v1/test", get(v1::object_test::handler))
        .route("/v1/rulesets", get(v1::rulesets::get))
        .route("/v1/rulesets", post(v1::rulesets::post))
        .with_state(state);

    let config = backend::config::Config::from_env();

    info!("Creating new sql pool");
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&config.database_url)
        .await
        .unwrap();

    info!("Binding port");
    let listener = tokio::net::TcpListener::bind("0.0.0.0:5050").await.unwrap();
    info!("Listening on {}", listener.local_addr().unwrap());

    info!("Starting SoCs");
    axum::serve(listener, app).await.unwrap();
}

async fn hello() -> &'static str {
    "Hello, world!"
}
