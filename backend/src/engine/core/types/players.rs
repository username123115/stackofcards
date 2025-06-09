use super::{identifiers::*, patterns};
use std::collections::HashMap;

pub struct PlayerClass {
    zones: HashMap<VariableIdentifier, ZoneClassIdentifier>,
    assignment_rule: PlayerAssignmentRule, // Determines if a player in the lobby should have this
                                           // class
}

pub enum PlayerAssignmentRule {
    All,
    Index(i64),
}

pub enum PlayerTarget {
    Single(SinglePlayerTarget),
    Multiple(MultiPlayerTarget),
}

pub enum SinglePlayerTarget {
    Increment(u64),                               //nth player after this one by order
    IncrementByClass(PlayerClassIdentifier, u64), //nth player after this one of this class
}
pub enum MultiPlayerTarget {
    All,                               //all players
    AllByClass(PlayerClassIdentifier), //all players of this class
}
