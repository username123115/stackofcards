use super::{cards, patterns};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use ts_rs::TS;

pub type Identifier = String;

pub type VariableIdentifier = Identifier;
pub type ZoneClassIdentifier = Identifier;
pub type PlayerClassIdentifier = Identifier;
pub type PhaseIdentifier = Identifier;

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

pub struct PlayerClass {
    zones: HashMap<VariableIdentifier, ZoneClassIdentifier>,
    assignment_rule: PlayerAssignmentRule,
}

pub enum PlayerAssignmentRule {
    All,
    Index(i64),
}

pub enum ZoneTarget {
    Single(SingleZoneTarget),
    Multiple(MultiZoneTarget),
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

pub enum MultiZoneTarget {
    Player {
        // player + desired zone for given player type
        player: MultiPlayerTarget,
        zone: HashMap<PlayerClassIdentifier, VariableIdentifier>,
    },
}

pub enum PlayerTarget {
    Single(SinglePlayerTarget),
    Multiple(MultiPlayerTarget),
}

pub enum SinglePlayerTarget {
    Increment(u64),                               //nth player after this one by order
    IncrementByClass(PlayerClassIdentifier, u64), //nth player after this one of this class
}
pub enum MultiPlayerTarget {
    All,                               //all players
    AllByClass(PlayerClassIdentifier), //all players of this class
}

pub struct Phase {}

pub enum PhaseInstruction {
    RunPhase(PhaseIdentifier),
    ShuffleZone(ZoneTarget),
    CreateCards {
        zone: ZoneTarget,
        cards: CardSet,
    },
    Deal {
        from: SingleZoneTarget,
        to: ZoneTarget,
        count: u64,
    },
}

pub struct GameConfig {
    pub allowed_ranks: HashSet<cards::Rank>,
    pub allowed_suits: HashSet<cards::Suit>,
    pub orders: HashMap<cards::OrderIdentifier, cards::RankOrder>,
    pub patterns: HashMap<patterns::PatternIdentifier, patterns::Pattern>,

    pub phases: HashMap<PhaseIdentifier, Phase>,
    pub zone_classes: HashMap<ZoneClassIdentifier, ZoneClass>,
    pub player_classes: HashMap<PlayerClassIdentifier, PlayerClass>,
    // For each player, game will go in order of this list and find the first class that matches
    pub player_assignment: Vec<PlayerClassIdentifier>,

    pub initial_zones: HashMap<VariableIdentifier, ZoneClassIdentifier>, //Engine sets these up first and
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

/*
Gin Rummy
Patterns
    Meld
        Set | Run
    Set (Three or more of same rank)
        Rank a3+
    Run (Four or more consecutive carads of same suite)
        Conesecutive 4+ && Suit a+
Zones
    Stock
        Rules : None
        Visibility : Owner
    Discard
        Rules : None
        Visibility : Owner

    PlayingDeck
        Rules : None
        Visibility : Owner
    Meld
        Rules : Meld
        Visibility : Public

Players
    RummyPlayer
        zones
            deck : PlayingDeck
        matching_rules : Match all

Initial_zones
    discard : Discard
    stock : Stock

Rummy phases
    Setup
        CreateCards ( { A234567890JQK, SCHD }, initial_zone(stock) )
        Shuffle ( initial_zone(stock) )
        Deal (initial_zone(stock), ZoneTarget (Player ( RummyPlayer, deck) ), 10)
        MoveTop (initial_zone(stock), initial_zone(discard))

    Play

*/
