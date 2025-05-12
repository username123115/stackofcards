use crate::engine::core::{cards, ruleset};
use cards::Card;
use std::collections::HashMap;

use cards::Deck;
use ruleset::Ruleset;

pub const PREALLOC_UPPER_LIMIT: u32 = 8;

#[derive(Debug)]
pub enum AddPlayerError {
    GameFull,
    GameStarted,
}

#[derive(Clone, Copy)]
pub enum GameStatus {
    Waiting,
    Ready,
    InProgress,
    Finished,
    Aborted,
}

pub struct Player {
    pub player_id: u32,
    pub deck: Deck,
}

pub struct Game {
    ruleset: Ruleset,
    players: HashMap<u32, Player>,
    deck: Deck,
    turn: u32,

    // simple way of tracking unique players, when a player joins increment
    // this number and assign it as their id, guarentees unique ids for players
    // within a game, and that a lower id means an earlier join time
    players_added: u32,
    game_status: GameStatus,
}

impl Game {
    pub fn new(ruleset: Ruleset) -> Game {
        let deck = Deck::new();

        let players: HashMap<u32, Player> = HashMap::new();
        let turn = 0;
        let status = GameStatus::Waiting;
        let players_added: u32 = 0;

        Game {
            ruleset,
            players,
            deck,
            turn,
            players_added,
            game_status: status,
        }
    }

    // returns opaque value representing player assigned id
    pub fn add_player(&mut self) -> Result<(u32), AddPlayerError> {
        let current_player_count: u32 = self.players.len().try_into().unwrap();
        // For now prevent adding players at all
        match self.game_status {
            GameStatus::Waiting => (),
            _other => return Result::Err(AddPlayerError::GameStarted),
        }
        if current_player_count >= self.ruleset.player_range.end {
            return Result::Err(AddPlayerError::GameFull);
        }

        let empty_deck = Deck::empty();
        let player_id = self.players_added;

        let player = Player {
            player_id,
            deck: empty_deck,
        };

        self.players_added += 1;
        self.players.insert(player_id, player);

        Result::Ok(player_id)
    }

    // Removes a player, returns whether or not player existed or not
    // TODO: should this return a boolean or player id instead, what is the utility of having
    // access to a removed player?
    // TODO: the ruleset should specify behavior that happens at the various stage of play
    // For now assume the default of the game being aborted if a player becomes removed
    pub fn remove_player(&mut self, id: u32) -> Option<Player> {
        match self.game_status {
            GameStatus::Waiting => (),
            _other => self.game_status = GameStatus::Aborted,
        }
        return self.players.remove(&id);
    }

    pub fn read_player<'a>(&'a self, id: u32) -> Option<&'a Player> {
        let player = self.players.get(&id);
        player
    }

    pub fn player_count(&self) -> u32 {
        self.players.len().try_into().unwrap()
    }
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
pub trait ContextAwareZoneActions: cards::CardZone {
    fn contextual_pick(&mut self, card: Card) -> Result<Card, ContextualPickError>;
    fn can_contextual_pick(&self, card: Card) -> Result<Card, ContextualPickError>;

    fn contextual_add(&mut self, card: Card) -> Result<(), ContextualAddError>;
    fn can_contextual_add(&mut self, card: Card) -> Result<(), ContextualAddError>;

    fn contextual_transfer<T: ContextAwareZoneActions>(
        &mut self,
        card: Card,
        to: &mut T,
    ) -> Result<(), ContextualTransferError>;
    fn can_contextual_transfer<T: ContextAwareZoneActions>(
        &self,
        card: Card,
        to: &T,
    ) -> Result<(), ContextualTransferError>;
}
