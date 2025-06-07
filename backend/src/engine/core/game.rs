use super::{cards, patterns};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use ts_rs::TS;

pub type Identifier = String;

pub type VariableIdentifier = Identifier;
pub type ZoneClassIdentifier = Identifier;
pub type PlayerClassIdentifier = Identifier;

pub enum ZoneVisibility {
    Owner,
    All,
}

pub struct ZoneClass {
    visibility: ZoneVisibility,
    rules: Vec<patterns::PatternIdentifier>, //Cards here after to match one of these patterns
}

pub struct PlayerClass {
    zones: HashMap<VariableIdentifier, ZoneClassIdentifier>,
    assignment_rule: PlayerAssignmentRule,
}

pub enum PlayerAssignmentRule {
    All,
    Index(i64),
}

pub enum ZoneTarget {
    Existing(VariableIdentifier), // one of the initial zones
    Class(ZoneClassIdentifier),   // any of zone type
    Player {
        // player + desired zone for given player type
        player: PlayerChoice,
        zone: HashMap<PlayerClassIdentifier, VariableIdentifier>,
    },
}

pub enum PlayerChoice {
    Increment(u64),                               //nth player after this one by order
    IncrementByClass(PlayerClassIdentifier, u64), //nth player after this one of this class
    All,                                          //all players
    AllByClass(PlayerClassIdentifier),            //all players of this class
}

pub struct GameConfig {
    pub allowed_ranks: HashSet<cards::Rank>,
    pub allowed_suits: HashSet<cards::Suit>,
    pub orders: HashMap<cards::OrderIdentifier, cards::RankOrder>,
    pub patterns: HashMap<patterns::PatternIdentifier, patterns::Pattern>,

    pub zone_classes: HashMap<ZoneClassIdentifier, ZoneClass>,
    pub player_classes: HashMap<PlayerClassIdentifier, PlayerClass>,
    // For each player, game will go in order of this list and find the first class that matches
    pub player_assignment: Vec<PlayerClassIdentifier>,

    pub initial_zones: HashMap<VariableIdentifier, ZoneClassIdentifier>, //Engine sets these up first and
}

// This describes ranks.len * suits.len cards
pub struct CardSet {
    pub ranks: Vec<cards::Rank>,
    pub suits: Vec<cards::Rank>,
}

pub struct GameState {
    pub cards: HashMap<u64, cards::Card>,
}

pub struct ActiveRuleset {
    cards: HashMap<u64, cards::Card>,
}
