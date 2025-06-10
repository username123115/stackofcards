use super::{identifiers::*, patterns};
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct PlayerClass {
    pub zones: HashMap<VariableIdentifier, ZoneClassIdentifier>,
    pub assignment_rule: PlayerAssignmentRule, // Determines if a player in the lobby should have this
                                               // class
}

#[derive(Debug, Clone)]
pub enum PlayerAssignmentRule {
    All,
    Index(i64),
}

#[derive(Debug, Clone)]
pub enum PlayerTarget {
    Single(SinglePlayerTarget),
    Multiple(MultiPlayerTarget),
}

#[derive(Debug, Clone)]
pub enum SinglePlayerTarget {
    Increment(u64),                               //nth player after this one by order
    IncrementByClass(PlayerClassIdentifier, u64), //nth player after this one of this class
}
#[derive(Debug, Clone)]
pub enum MultiPlayerTarget {
    All,                               //all players
    AllByClass(PlayerClassIdentifier), //all players of this class
}
