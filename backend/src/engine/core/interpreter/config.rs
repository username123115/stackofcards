use super::lang::phases;
use crate::engine::core::types::*;
use identifiers::*;

use std::collections::{HashMap, HashSet};
use std::hash::{DefaultHasher, Hash, Hasher};
use std::ops::Range;

use serde::{Deserialize, Serialize};
use ts_rs::TS;

use thiserror::Error;

#[derive(TS, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct GameConfig {
    pub allowed_ranks: HashSet<ranks::Rank>,
    pub allowed_suits: HashSet<suits::Suit>,
    pub orders: HashMap<OrderIdentifier, rank_order::RankOrder>,
    pub patterns: HashMap<patterns::PatternIdentifier, Vec<patterns::Pattern>>,

    pub phases: HashMap<PhaseIdentifier, phases::Phase>,
    pub zone_classes: HashMap<ZoneClassIdentifier, zones::ZoneClass>,
    pub player_classes: HashMap<PlayerClassIdentifier, players::PlayerClass>,
    pub player_zones: HashMap<VariableIdentifier, ZoneClassIdentifier>,
    // For each player, game will go in order of this list and find the first class that matches
    pub player_assignment: Vec<PlayerClassIdentifier>,
    pub initial_zones: HashMap<VariableIdentifier, ZoneClassIdentifier>, //Engine sets these up first and

    pub initial_phase: PhaseIdentifier,
    pub player_range: Range<u32>,
    pub numbers: HashSet<VariableIdentifier>,
}

impl std::fmt::Debug for GameConfig {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match serde_json::to_string(&self) {
            Ok(ser) => {
                let mut hasher = DefaultHasher::new();
                ser.hash(&mut hasher);
                let hash_value = hasher.finish();

                write!(f, "GameConfig {{ hash: {:x} }}", hash_value)
            }
            Err(e) => {
                write!(f, "GameConfig {{ unserialized: {:?} }}", e)
            }
        }
    }
}

impl GameConfig {
    pub fn blank() -> Self {
        Self {
            allowed_ranks: HashSet::new(),
            allowed_suits: HashSet::new(),
            orders: HashMap::new(),
            patterns: HashMap::new(),

            phases: HashMap::new(),
            zone_classes: HashMap::new(),
            player_classes: HashMap::new(),
            player_assignment: Vec::new(),

            player_zones: HashMap::new(),

            initial_zones: HashMap::new(),
            initial_phase: "".into(),

            player_range: 2..6,
            numbers: HashSet::new(),
        }
    }
}

#[derive(Error, Debug)]
pub enum ConfigError {
    #[error("The phase '{0}' does not exist")]
    NonexistantPhase(String),
}
