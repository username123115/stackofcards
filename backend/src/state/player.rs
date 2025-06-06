use serde::{Deserialize, Serialize};
use std::collections::HashMap;
pub type PlayerId = String;
use ts_rs::TS;

#[derive(TS, Clone, Debug, Serialize, Deserialize)]
#[ts(export)]
pub struct PlayerInformation {
    pub nickname: String,
    pub disconnected: Option<u64>, //Seconds since last disconnected
}

#[derive(TS, Debug, Clone, Deserialize, Serialize)]
#[ts(export)]
pub struct PlayerSnapshot {
    pub players: HashMap<PlayerId, PlayerInformation>,
    pub order: Vec<PlayerId>,
}
