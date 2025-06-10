use super::{cards, identifiers::*, patterns, players};
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct ZoneVisibility {
    owner: ZoneVisibilityRule, //Created player (or no one if this is a game created deck)
    others: ZoneVisibilityRule,
}

#[derive(Debug, Clone)]
pub enum ZoneVisibilityRule {
    Visible,
    Hidden,
    Top,
    Bottom,
}

#[derive(Debug, Clone)]
pub enum CardSelector {
    Top,
    Bottom,
    Suit(cards::Suit), //select all of a suit
    Rank(cards::Rank), //select all of a rank
}

#[derive(Debug, Clone)]
pub struct ZoneClass {
    visibility: ZoneVisibility,
    cleanup: ZoneCleanupBehavior,
    rules: Vec<patterns::PatternIdentifier>, //Cards here after to match one of these patterns
}

#[derive(Debug, Clone)]
pub enum ZoneCleanupBehavior {
    Never,
    OnEmpty,
}

#[derive(Debug, Clone)]
pub enum ZoneTarget {
    Single(SingleZoneTarget),
    Multiple(MultiZoneTarget),
}

#[derive(Debug, Clone)]
pub enum MultiZoneTarget {
    Player {
        // player + desired zone for given player type
        player: players::MultiPlayerTarget,
        zone: HashMap<PlayerClassIdentifier, VariableIdentifier>,
    },
}

#[derive(Debug, Clone)]
pub enum SingleZoneTarget {
    Existing(VariableIdentifier), // one of the initial zones
    Player {
        // player + desired zone for given player type
        player: players::SinglePlayerTarget,
        zone: HashMap<PlayerClassIdentifier, VariableIdentifier>,
    },
    Create(ZoneClassIdentifier),
}
