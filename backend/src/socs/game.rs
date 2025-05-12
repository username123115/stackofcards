use crate::engine::ruleset;
use chrono::{DateTime, Utc};
use ts_rs::TS;
use uuid::Uuid;

#[derive(TS, Debug, Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord)]
#[ts(export)]
pub enum GameVisibility {
    Waiting,
    Ready,
    InProgress,
    Finished,
    Aborted,
}

pub struct GameMeta<'a> {
    game_id: Uuid,
    ruleset: &'a ruleset::Ruleset,

    code: u32,
    current_players: u32,
}
