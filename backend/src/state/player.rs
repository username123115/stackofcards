use serde::{Deserialize, Serialize};
pub type PlayerId = String;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PlayerInformation {
    pub nickname: String,
    pub player_id: PlayerId,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct PlayerSnapshot {
    pub players: Vec<PlayerInformation>,
    pub order: Vec<PlayerId>,
}
