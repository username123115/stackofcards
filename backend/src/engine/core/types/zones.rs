use super::{cards, identifiers::*, patterns, players, ranks, suits};
use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct ZoneVisibility {
    owner: ZoneVisibilityRule, //Created player (or no one if this is a game created deck)
    others: ZoneVisibilityRule,
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum ZoneVisibilityRule {
    Visible,
    Hidden,
    Top,
    Bottom,
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum CardSelector {
    Top,
    Bottom,
    Suit(suits::Suit), //select all of a suit
    Rank(ranks::Rank), //select all of a rank
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct ZoneClass {
    visibility: ZoneVisibility,
    cleanup: ZoneCleanupBehavior,
    rules: Vec<patterns::PatternIdentifier>, //Cards here after to match one of these patterns
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum ZoneCleanupBehavior {
    Never,
    OnEmpty,
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum ZoneTarget {
    Single(SingleZoneTarget),
    Multiple(MultiZoneTarget),
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum MultiZoneTarget {
    Player {
        // player + desired zone for given player type
        player: players::MultiPlayerTarget,
        zone: HashMap<PlayerClassIdentifier, VariableIdentifier>,
    },
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum SingleZoneTarget {
    Existing(VariableIdentifier), // one of the initial zones
    Player {
        // player + desired zone for given player type
        player: players::SinglePlayerTarget,
        zone: HashMap<PlayerClassIdentifier, VariableIdentifier>,
    },
    Create(ZoneClassIdentifier),
}
