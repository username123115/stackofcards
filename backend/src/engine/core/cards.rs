//physical layer implementing card and decks

use ts_rs::TS;

#[derive(TS, Debug, Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord)]
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

#[derive(TS, Debug, Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord)]
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

#[derive(TS, Debug, Clone, Copy, PartialEq, Eq, Hash)]
#[ts(export)]
pub struct Card {
    suit: Suit,
    rank: Rank,
}

impl Card {
    pub fn new(suit: Suit, rank: Rank) -> Self {
        Self { suit, rank }
    }
}

#[derive(TS)]
#[ts(export)]
pub struct Deck {
    pub cards: Vec<Card>,
}

// Ruleset declares how many zones there are, and a set of functions that apply to each zone during
// play
//
#[derive(Debug)]
pub enum PickError {
    NotFound,
}

#[derive(Debug)]
pub enum AddError {
    Full,
}

#[derive(Debug)]
pub enum TransferError {
    Pick(PickError),
    Add(AddError),
}

pub trait CardZone {
    fn distinct_cards(&self) -> Vec<Card>;

    // removes a card from the deck
    fn pick(&mut self, card: Card) -> Result<Card, PickError>;
    fn can_pick(&self, card: Card) -> Result<(), PickError>;

    fn add(&mut self, card: Card) -> Result<(), AddError>;
    fn can_add(&self, card: Card) -> Result<(), AddError>;

    fn transfer<T: CardZone>(&mut self, card: Card, to: &mut T) -> Result<(), TransferError> {
        self.can_pick(card).map_err(TransferError::Pick)?;
        self.can_add(card).map_err(TransferError::Add)?;

        self.pick(card)
            .expect("pick failed after can_pick reported Ok");
        to.add(card).expect("add failed after can_add reported Ok");

        Ok(())
    }
}

impl Deck {
    pub fn new() -> Self {
        let mut cards: Vec<Card> = Vec::new();

        for &rank in Rank::all().iter() {
            for &suit in Suit::all().iter() {
                cards.push(Card::new(suit, rank));
            }
        }
        Deck { cards }
    }

    pub fn empty() -> Self {
        let cards: Vec<Card> = Vec::new();
        Deck { cards }
    }
}
