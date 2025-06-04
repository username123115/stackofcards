use super::player;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize)]
pub enum GameAction {
    SetCards,
    Layout,
    Private,
    JoinResult(Result<(), String>),
}

#[derive(Debug, Copy, Clone, Serialize, Deserialize)]
pub enum GameStatus {
    Waiting,
    Started,
    Invalid,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct GameSnapshot {
    pub actions: Option<Vec<GameAction>>,
    pub private_actions: Option<Vec<GameAction>>,
    pub players: Option<player::PlayerSnapshot>,
    pub status: GameStatus,
}

impl GameSnapshot {
    pub fn new() -> Self {
        Self {
            actions: None,
            private_actions: None,
            players: None,
            status: GameStatus::Invalid,
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
