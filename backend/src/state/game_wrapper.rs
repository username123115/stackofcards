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
}

#[derive(TS, Debug, Clone, Deserialize, Serialize)]
#[ts(export)]
// Player tells game that it has done something
// TODO: Engine impl
pub enum GameCommand {}

#[derive(TS, Debug, Clone, Deserialize, Serialize)]
#[ts(export)]
pub struct GameSnapshot {
    pub actions: Option<Vec<GameAction>>,
    pub private_actions: Option<Vec<GameAction>>,
    pub players: Option<player::PlayerSnapshot>,
    pub status: state::GameStatus,
}

impl GameSnapshot {
    pub fn new() -> Self {
        Self {
            actions: None,
            private_actions: None,
            players: None,
            status: state::GameStatus::Invalid,
        }
    }
    pub fn add_action(&mut self, action: GameAction) {
        if let Some(actions) = &mut self.actions {
            actions.push(action);
        } else {
            self.private_actions = Some(vec![action]);
        }
    }

    pub fn add_private_action(&mut self, action: GameAction) {
        if let Some(actions) = &mut self.private_actions {
            actions.push(action);
        } else {
            self.private_actions = Some(vec![action]);
        }
    }
}
