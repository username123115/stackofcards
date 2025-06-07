use crate::engine::core::{cards, ruleset};
use std::collections::HashMap;

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
}

pub struct Game {
    ruleset: Ruleset,
    players: HashMap<u32, Player>,
    turn: u32,

    // simple way of tracking unique players, when a player joins increment
    // this number and assign it as their id, guarentees unique ids for players
    // within a game, and that a lower id means an earlier join time
    players_added: u32,
    game_status: GameStatus,
}
