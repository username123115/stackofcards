use serde::{Deserialize, Serialize};
use ts_rs::TS;

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
