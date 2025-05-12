use crate::engine::{cards, game, ruleset};
use std::cmp;
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
