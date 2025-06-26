use crate::engine::core::types::cards;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use ts_rs::TS;

use crate::engine::core::interpreter::state;

#[derive(TS, Debug, Clone, Deserialize, Serialize)]
#[ts(export)]
// Game tells player that something about it has changed
pub enum GameAction {
    SetCards,
    Layout,
    Private,
    JoinResult(Result<PlayerId, String>),
    ChatMsg(GameChat),
}

#[derive(TS, Debug, Clone, Deserialize, Serialize)]
#[ts(export)]
pub struct GameChat {
    pub from: Option<PlayerId>,
    pub contents: String,
}

#[derive(TS, Debug, Clone, Deserialize, Serialize)]
#[ts(export)]
// Player tells game that it has done something
// TODO: Engine impl
pub enum PlayerCommand {
    StartGame,
    SendMsg(String),
}

#[derive(TS, Debug, Clone, Deserialize, Serialize)]
#[ts(export)]
pub struct GameSnapshot {
    pub actions: Vec<GameAction>,
    pub private_actions: Vec<GameAction>,
    pub players: Option<PlayerSnapshot>,
    pub status: state::GameStatus,
    pub public_cards: HashMap<u32, cards::Card>,
    pub zones: Vec<ZoneSnapshot>,
}

#[derive(TS, Debug, Clone, Deserialize, Serialize)]
#[ts(export)]
pub struct ZoneSnapshot {
    pub cards: Vec<u32>,
    pub owner: Option<u32>,
    pub display_name: Option<String>,
    pub zone_id: u32,
}

impl GameSnapshot {
    pub fn new() -> Self {
        Self {
            actions: Vec::new(),
            private_actions: Vec::new(),
            players: None,
            status: state::GameStatus::Invalid,
            public_cards: HashMap::new(),
            zones: Vec::new(),
        }
    }
    pub fn add_action(&mut self, action: GameAction) {
        self.actions.push(action);
    }

    pub fn add_private_action(&mut self, action: GameAction) {
        self.private_actions.push(action);
    }
}

pub type PlayerId = String;

#[derive(TS, Clone, Debug, Serialize, Deserialize)]
#[ts(export)]
pub struct PlayerInformation {
    pub nickname: String,
    pub role: Option<PlayerRole>,
    pub disconnected: Option<u64>, //Seconds since last disconnected
}

#[derive(TS, Clone, Debug, Serialize, Deserialize)]
#[ts(export)]
pub struct PlayerRole {
    pub order: u64,
    pub role: String,
}

#[derive(TS, Debug, Clone, Deserialize, Serialize)]
#[ts(export)]
pub struct PlayerSnapshot {
    pub players: HashMap<PlayerId, PlayerInformation>,
    pub order: Vec<PlayerId>,
}
