use super::{cards, identifiers::*, patterns, players};
use std::collections::HashMap;

pub enum ZoneVisibility {
    Owner,
    All,
}

pub struct ZoneClass {
    visibility: ZoneVisibility,
    rules: Vec<patterns::PatternIdentifier>, //Cards here after to match one of these patterns
}

// Concrete initiated zone
pub struct Zone {
    cards: Vec<cards::Card>,
    zone_type: ZoneClassIdentifier,
}

pub enum ZoneTarget {
    Single(SingleZoneTarget),
    Multiple(MultiZoneTarget),
}

pub enum MultiZoneTarget {
    Player {
        // player + desired zone for given player type
        player: players::MultiPlayerTarget,
        zone: HashMap<PlayerClassIdentifier, VariableIdentifier>,
    },
}

pub enum SingleZoneTarget {
    Existing(VariableIdentifier), // one of the initial zones
    Player {
        // player + desired zone for given player type
        player: players::SinglePlayerTarget,
        zone: HashMap<PlayerClassIdentifier, VariableIdentifier>,
    },
    Create(ZoneClassIdentifier),
}
