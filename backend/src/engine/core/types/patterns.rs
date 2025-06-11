use super::{cards, rank_order, ranks, suits};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub type PatternIdentifier = String;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PatternPiece<T> {
    pub match_min: u64,
    pub match_max: u64,
    pub pattern: T,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Relation {
    Consecutive(cards::OrderIdentifier),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
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
        orderings: HashMap<cards::OrderIdentifier, rank_order::RankOrder>,
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
