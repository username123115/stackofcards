use crate::engine::{cards, game, ruleset};
use std::cmp;

use cards::Deck;
use ruleset::Ruleset;

pub const PREALLOC_UPPER_LIMIT: u32 = 8;

pub enum ErrorAddPlayer {
    GameFull,
    GameStarted,
    Unknown,
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
    pub order: u32,
    pub deck: Deck,
}

pub struct Game {
    ruleset: Ruleset,
    players: Vec<Player>,
    deck: Deck,
    turn: u32,
    status: GameStatus,
}

impl Game {
    pub fn new(ruleset: Ruleset) -> Game {
        let deck = Deck::new();

        let players: Vec<Player> = Vec::with_capacity(
            cmp::min(PREALLOC_UPPER_LIMIT, ruleset.player_range.end)
                .try_into()
                .unwrap(),
        );
        let turn = 0;
        let status = GameStatus::Waiting;

        Game {
            ruleset,
            players,
            deck,
            turn,
            status,
        }
    }

    //TODO: This API assumes that players won't be deleted (e.g. disconnecting from game)
    // In general order is very messed up probably have to do a mapping between ID and order,
    // removal API needs to be implemented
    pub fn add_player(&mut self) -> Result<(), ErrorAddPlayer> {
        let current_player_count: u32 = self.players.len().try_into().unwrap();
        // For now prevent adding players at all
        match self.status {
            GameStatus::Waiting => (),
            _other => return Result::Err(ErrorAddPlayer::GameStarted),
        }
        if current_player_count >= self.ruleset.player_range.end {
            return Result::Err(ErrorAddPlayer::GameFull);
        }

        let empty_deck = Deck::empty();
        let player = Player {
            order: current_player_count,
            deck: empty_deck,
        };

        self.players.push(player);

        Result::Ok(())
    }
}
