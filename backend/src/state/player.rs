use serde::{Deserialize, Serialize};
pub type PlayerId = String;
use ts_rs::TS;

#[derive(TS, Clone, Debug, Serialize, Deserialize)]
#[ts(export)]
pub struct PlayerInformation {
    pub nickname: String,
    pub player_id: PlayerId,
}

#[derive(TS, Debug, Clone, Deserialize, Serialize)]
#[ts(export)]
pub struct PlayerSnapshot {
    pub players: Vec<PlayerInformation>,
    pub order: Vec<PlayerId>,
}
