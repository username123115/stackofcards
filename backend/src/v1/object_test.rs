use axum::Json;
use serde::{Deserialize, Serialize};

use ts_rs::TS;

#[derive(TS, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct RustObject {
    pub views: i32,
    pub name: String,
}

pub async fn handler() -> Json<RustObject> {
    let views = 3;
    let name = String::from("Kai Cenat");
    Json(RustObject { views, name })
}
