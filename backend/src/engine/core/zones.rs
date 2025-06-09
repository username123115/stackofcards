use super::{cards, identifiers::*, patterns};
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
}

pub enum ZoneTarget {
    Single(SingleZoneTarget),
    Multiple(MultiZoneTarget),
}

pub enum MultiZoneTarget {
    Player {
        // player + desired zone for given player type
        player: MultiPlayerTarget,
        zone: HashMap<PlayerClassIdentifier, VariableIdentifier>,
    },
}

pub enum SingleZoneTarget {
    Existing(VariableIdentifier), // one of the initial zones
    Player {
        // player + desired zone for given player type
        player: SinglePlayerTarget,
        zone: HashMap<PlayerClassIdentifier, VariableIdentifier>,
    },
    Create(ZoneClassIdentifier),
}
