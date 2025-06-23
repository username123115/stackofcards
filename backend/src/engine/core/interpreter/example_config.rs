use super::config;
use crate::engine::core::types::players;
use players::PlayerAssignmentRule;

use std::collections::{HashMap, HashSet};

pub fn gen_example_config() -> config::GameConfig {
    let mut player_classes = HashMap::new();
    let player_assignment = vec![
        "FirstPlayer".into(),
        "LastPlayer".into(),
        "DefaultPlayer".into(),
    ];

    player_classes.insert(
        "DefaultPlayer".into(),
        empty_player(PlayerAssignmentRule::All),
    );

    config::GameConfig {
        allowed_ranks: HashSet::new(),
        allowed_suits: HashSet::new(),
        orders: HashMap::new(),
        patterns: HashMap::new(),

        phases: HashMap::new(),
        zone_classes: HashMap::new(),
        player_classes,
        player_assignment,

        player_zones: HashMap::new(),

        initial_zones: HashMap::new(),
        initial_phase: "Todo".into(),

        player_range: 2..6,
        numbers: HashSet::new(),
    }
}

pub fn empty_player(rule: players::PlayerAssignmentRule) -> players::PlayerClass {
    players::PlayerClass {
        active_zones: HashSet::new(),
        assignment_rule: rule,
    }
}
