//physical layer implementing card and decks

use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(TS, Debug, Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize)]
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

#[derive(TS, Debug, Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize)]
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

#[derive(TS, Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[ts(export)]
pub struct Card {
    suit: Suit,
    rank: Rank,
    card_id: u64,
}

impl Card {
    pub fn new(suit: Suit, rank: Rank, card_id: u64) -> Self {
        Self {
            suit,
            rank,
            card_id,
        }
    }
}

#[derive(TS)]
#[ts(export)]
pub struct Deck {
    pub cards: Vec<Card>,
}
