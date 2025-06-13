use super::{identifiers::*, patterns};
use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct PlayerClass {
    pub zones: HashMap<VariableIdentifier, ZoneClassIdentifier>,
    pub assignment_rule: PlayerAssignmentRule, // Determines if a player in the lobby should have this
                                               // class
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum PlayerAssignmentRule {
    All,
    Index(i64),
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum PlayerTarget {
    Single(SinglePlayerTarget),
    Multiple(MultiPlayerTarget),
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum SinglePlayerTarget {
    Increment(u64),                               //nth player after this one by order
    IncrementByClass(PlayerClassIdentifier, u64), //nth player after this one of this class
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum MultiPlayerTarget {
    All,                               //all players
    AllByClass(PlayerClassIdentifier), //all players of this class
}
