use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use ts_rs::TS;

use super::{ranks::Rank, suits::Suit};

pub type OrderIdentifier = String;
pub type CardIdentifier = u32;

#[derive(TS, Debug, Clone, Copy, Hash, Serialize, Deserialize)]
#[ts(export)]
pub struct Card {
    pub suit: Suit,
    pub rank: Rank,
    pub card_id: CardIdentifier,
}

impl Card {
    pub fn new(suit: Suit, rank: Rank, card_id: CardIdentifier) -> Self {
        Self {
            suit,
            rank,
            card_id,
        }
    }
}

// This describes ranks.len * suits.len cards
#[derive(Debug, Clone)]
pub struct CardSet {
    pub ranks: Vec<Rank>,
    pub suits: Vec<Rank>,
}
