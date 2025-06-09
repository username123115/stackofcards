use super::types::{cards, identifiers::*, patterns, players, zones};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use ts_rs::TS;

pub struct Phase {}

pub enum CardSelector {
    Top,
    Bottom,
    IfMatches(patterns::Pattern),
}

pub enum PhaseInstruction {
    RunPhase(PhaseIdentifier),
    ShuffleZone(zones::ZoneTarget),
    CreateCards {
        zone: zones::ZoneTarget,
        cards: cards::CardSet,
    },
    Deal {
        from: zones::SingleZoneTarget,
        to: zones::ZoneTarget,
        count: u64,
    },
    Move {
        from: players::SinglePlayerTarget,
        to: zones::SingleZoneTarget,
        selector: CardSelector,
    },
}

pub struct GameConfig {
    pub allowed_ranks: HashSet<cards::Rank>,
    pub allowed_suits: HashSet<cards::Suit>,
    pub orders: HashMap<cards::OrderIdentifier, cards::RankOrder>,
    pub patterns: HashMap<patterns::PatternIdentifier, patterns::Pattern>,

    pub phases: HashMap<PhaseIdentifier, Phase>,
    pub zone_classes: HashMap<ZoneClassIdentifier, zones::ZoneClass>,
    pub player_classes: HashMap<PlayerClassIdentifier, players::PlayerClass>,
    // For each player, game will go in order of this list and find the first class that matches
    pub player_assignment: Vec<PlayerClassIdentifier>,

    pub initial_zones: HashMap<VariableIdentifier, ZoneClassIdentifier>, //Engine sets these up first and
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
