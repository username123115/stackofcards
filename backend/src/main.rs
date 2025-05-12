use axum::{Router, response::Html, routing::get, serve};
use sqlx::postgres::PgPoolOptions;

use backend::v1;
use tracing::{Level, event, info};
use tracing_subscriber;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let app = Router::new()
        .route("/v1/hello", get(hello))
        .route("/v1/test", get(v1::object_test::handler));

    info!("Binding port");
    let listener = tokio::net::TcpListener::bind("0.0.0.0:5050").await.unwrap();
    info!("Listening on {}", listener.local_addr().unwrap());

    info!("Starting SoCs");
    axum::serve(listener, app).await.unwrap();
}

async fn hello() -> &'static str {
    "Hello, world!"
}
