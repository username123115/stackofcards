use super::config;
use crate::engine::core::types::{cards, identifiers::*, patterns, players, zones};
use players::PlayerAssignmentRule;

use std::collections::{HashMap, HashSet};
use std::ops::Range;

pub fn gen_example_config() -> config::GameConfig {
    let mut player_classes = HashMap::new();
    let player_assignment = vec![
        "FirstPlayer".into(),
        "LastPlayer".into(),
        "DefaultPlayer".into(),
    ];

    player_classes.insert(
        "FirstPlayer".into(),
        empty_player(PlayerAssignmentRule::Index(0)),
    );
    player_classes.insert(
        "LastPlayer".into(),
        empty_player(PlayerAssignmentRule::Index(-1)),
    );
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

        initial_zones: HashMap::new(),
        initial_phase: "Todo".into(),

        player_range: 2..6,
    }
}

pub fn empty_player(rule: players::PlayerAssignmentRule) -> players::PlayerClass {
    players::PlayerClass {
        zones: HashMap::new(),
        assignment_rule: rule,
    }
}
