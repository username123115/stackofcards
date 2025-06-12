use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use ts_rs::TS;

use super::{ranks::Rank, suits::Suit};

#[derive(TS, Debug, Clone, Copy, Hash, Serialize, Deserialize)]
#[ts(export)]
pub struct Card {
    pub suit: Suit,
    pub rank: Rank,
}

impl Card {
    pub fn new(suit: Suit, rank: Rank) -> Self {
        Self { suit, rank }
    }
}

// This describes ranks.len * suits.len cards
#[derive(Debug, Clone)]
pub struct CardSet {
    pub ranks: Vec<Rank>,
    pub suits: Vec<Suit>,
}
