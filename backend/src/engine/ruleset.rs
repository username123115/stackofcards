// rule layer dictates further restrictions on handling cards and zones defined in card layer
/*
* General ideas
*
* Assumptions: Sequential play, players play in order one by one / only ask for one player to make
* a move at a time
*
* Continuation: Support playing up until card exhaustion
*/

/*
* Engine ideas
*
* Conditions: Win, Tie, Draw, Abort
*
*
*
* Continuation - Exits: Can the game continue if a player leaves?
*
*/

use std::ops::Range;
use crate::engine::cards
use cards::Card

pub struct Ruleset {
    pub player_range: Range<u32>,
}

pub struct Stage {

}

pub enum ContextualPickError {
    Mechanical(cards::PickError),
    Violation(String),
}

pub enum ContextualAddError {
    Mechanical(cards::AddError),
    Violation(String),
}

pub enum ContextualTransferError {
    Mechanical(cards::TransferError),
    Violation(String),
}

// This is a card zone that obeys rules beyond physics
pub trait ContextAwareZoneActions : cards::CardZone {
    fn contextual_pick(&mut self, card: Card) -> Result<Card, ContextualPickError>;
    fn can_contextual_pick(&self, card: Card) -> Result<Card, ContextualPickError>;

    fn contextual_add(&mut self, card: Card) -> Result<(), ContextualAddError>;
    fn can_contextual_add(&mut self, card: Card) -> Result<(), ContextualAddError>;

    fn contextual_transfer<T : ContextAwareZoneActions>(&mut self, card: Card, to: &mut T) -> Result<(), ContextualTransferError>
    fn can_contextual_transfer<T: ContextAwareZoneActions>(&self, card: Card, to: &T) -> Result<(), ContextualTransferError>
}
