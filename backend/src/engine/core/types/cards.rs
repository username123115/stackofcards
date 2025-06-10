use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use ts_rs::TS;

pub type OrderIdentifier = String;
pub type CardIdentifier = u32;

#[derive(TS, Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[ts(export)]
pub enum Suit {
    Hearts,
    Diamonds,
    Spades,
    Clubs,
}

impl Suit {
    pub fn all() -> [Suit; 4] {
        use Suit::*;
        [Hearts, Diamonds, Spades, Clubs]
    }
}

#[derive(TS, Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[ts(export)]
pub enum Rank {
    Two,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
    Ten,
    Jack,
    Queen,
    King,
    Ace,
}

impl Rank {
    pub fn all() -> [Rank; 13] {
        use Rank::*;
        [
            Ace, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Jack, Queen, King,
        ]
    }
}

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

#[derive(TS, Debug, Clone, Serialize, Deserialize)]
pub struct RankOrder {
    order: Vec<Rank>,
    rank_to_index: HashMap<Rank, usize>,
}

impl RankOrder {
    pub fn new(order: Vec<Rank>) -> Self {
        let rank_to_index: HashMap<Rank, usize> = order
            .iter()
            .enumerate()
            .map(|(index, rank)| (*rank, index))
            .collect();
        Self {
            order,
            rank_to_index,
        }
    }

    pub fn get_index(&self, card: Card) -> usize {
        *self.rank_to_index.get(&card.rank).unwrap()
    }
}

// This describes ranks.len * suits.len cards
#[derive(Debug, Clone)]
pub struct CardSet {
    pub ranks: Vec<Rank>,
    pub suits: Vec<Rank>,
}
