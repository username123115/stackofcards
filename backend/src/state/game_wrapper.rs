use super::player;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::engine::core::interpreter::state;

#[derive(TS, Debug, Clone, Deserialize, Serialize)]
#[ts(export)]
// Game tells player that something about it has changed
pub enum GameAction {
    SetCards,
    Layout,
    Private,
    JoinResult(Result<player::PlayerId, String>),
    ChatMsg(GameChat),
}

#[derive(TS, Debug, Clone, Deserialize, Serialize)]
#[ts(export)]
pub struct GameChat {
    pub from: Option<player::PlayerId>,
    pub contents: String,
}

#[derive(TS, Debug, Clone, Deserialize, Serialize)]
#[ts(export)]
// Player tells game that it has done something
// TODO: Engine impl
pub enum PlayerCommand {
    StartGame,
}

#[derive(TS, Debug, Clone, Deserialize, Serialize)]
#[ts(export)]
pub struct GameSnapshot {
    pub actions: Vec<GameAction>,
    pub private_actions: Vec<GameAction>,
    pub players: Option<player::PlayerSnapshot>,
    pub status: state::GameStatus,
}

impl GameSnapshot {
    pub fn new() -> Self {
        Self {
            actions: Vec::new(),
            private_actions: Vec::new(),
            players: None,
            status: state::GameStatus::Invalid,
        }
    }
    pub fn add_action(&mut self, action: GameAction) {
        self.actions.push(action);
    }

    pub fn add_private_action(&mut self, action: GameAction) {
        self.private_actions.push(action);
    }
}
