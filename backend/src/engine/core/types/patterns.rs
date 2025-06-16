use super::{cards, identifiers::OrderIdentifier, rank_order, ranks, suits};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use std::collections::HashMap;

pub type PatternIdentifier = String;

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct PatternPiece<T> {
    pub match_min: u32,
    pub match_max: u32,
    pub pattern: T,
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum Relation {
    Consecutive(OrderIdentifier),
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum Pattern {
    Relation(Relation),
    Suit(Vec<PatternPiece<Option<suits::Suit>>>),
    Rank(Vec<PatternPiece<Option<ranks::Rank>>>),
}

pub struct Matcher<'a> {
    card_map: &'a HashMap<u64, cards::Card>,
    patterns: &'a Vec<Pattern>,
    cards: &'a mut Vec<u64>,
}

impl<'a> Matcher<'a> {
    pub fn new(
        card_map: &'a HashMap<u64, cards::Card>,
        patterns: &'a Vec<Pattern>,
        orderings: HashMap<OrderIdentifier, rank_order::RankOrder>,
        cards: &'a mut Vec<u64>,
    ) -> Self {
        Self {
            card_map,
            patterns,
            cards,
        }
    }

    pub fn match_patterns(&mut self) -> bool {
        let mut first_pattern = true;
        for pattern in self.patterns.iter() {
            if first_pattern {
                first_pattern = false;
            } else {
            }
        }
        false
    }

    pub fn pattern_mutate(&mut self, pattern: &Pattern) -> bool {
        // match pattern {}
        false
    }
}
