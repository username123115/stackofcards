use super::{cards, patterns};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use ts_rs::TS;

pub type OrderIdentifier = String;
pub type PatternIdentifier = String;
pub type VariableIdentifier = String;

pub enum ZoneVisibility {
    Owner,
    All,
}

pub struct ZoneDef {
    visibility: ZoneVisibility,
    rules: Vec<PatternIdentifier>, //Cards here after to match one of these patterns
}

pub struct GameConfig {
    pub allowed_ranks: HashSet<cards::Rank>,
    pub allowed_suits: HashSet<cards::Suit>,
    pub orders: HashMap<OrderIdentifier, cards::RankOrder>,
    pub patterns: HashMap<PatternIdentifier, patterns::Pattern>,
    pub initial_zones: HashMap<VariableIdentifier, ZoneDef>, //Engine sets these up first
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
