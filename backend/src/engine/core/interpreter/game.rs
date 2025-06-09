use super::phases;
use crate::engine::core::types::{cards, identifiers::*, patterns, players, zones};

use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use ts_rs::TS;

pub struct GameConfig {
    pub allowed_ranks: HashSet<cards::Rank>,
    pub allowed_suits: HashSet<cards::Suit>,
    pub orders: HashMap<cards::OrderIdentifier, cards::RankOrder>,
    pub patterns: HashMap<patterns::PatternIdentifier, patterns::Pattern>,

    pub phases: HashMap<PhaseIdentifier, phases::Phase>,
    pub zone_classes: HashMap<ZoneClassIdentifier, zones::ZoneClass>,
    pub player_classes: HashMap<PlayerClassIdentifier, players::PlayerClass>,
    // For each player, game will go in order of this list and find the first class that matches
    pub player_assignment: Vec<PlayerClassIdentifier>,

    pub initial_zones: HashMap<VariableIdentifier, ZoneClassIdentifier>, //Engine sets these up first and
}

pub struct GameState {
    pub cards: HashMap<u64, cards::Card>,
}

pub struct ActiveRuleset {
    cards: HashMap<u64, cards::Card>,
}
