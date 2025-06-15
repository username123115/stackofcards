use super::lang::phases;
use crate::engine::core::types::*;
use identifiers::*;

use std::collections::{HashMap, HashSet};
use std::ops::Range;

use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct GameConfig {
    pub allowed_ranks: HashSet<ranks::Rank>,
    pub allowed_suits: HashSet<suits::Suit>,
    pub orders: HashMap<OrderIdentifier, rank_order::RankOrder>,
    pub patterns: HashMap<patterns::PatternIdentifier, Vec<patterns::Pattern>>,

    pub phases: HashMap<PhaseIdentifier, phases::Phase>,
    pub zone_classes: HashMap<ZoneClassIdentifier, zones::ZoneClass>,
    pub player_classes: HashMap<PlayerClassIdentifier, players::PlayerClass>,
    // For each player, game will go in order of this list and find the first class that matches
    pub player_assignment: Vec<PlayerClassIdentifier>,
    pub initial_zones: HashMap<VariableIdentifier, ZoneClassIdentifier>, //Engine sets these up first and

    pub initial_phase: PhaseIdentifier,
    pub player_range: Range<u64>,
}
