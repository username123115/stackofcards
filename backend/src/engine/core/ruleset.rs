use serde::{Deserialize, Serialize};
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
*
*
*/

pub type ZoneId = String;
pub type ZoneInstanceId = String;

pub type StageId = String;
pub type Tag = String;

use std::ops::Range;

// Determines how drawing behavior works
pub enum ZoneOrdering {
    Ordered,   // the zone is ordered and drawn / added to sequentially
    Unordered, // set of cards, any may be picked
    Shuffled,  // shuffle on a draw
}

pub enum ZoneOwner {
    Game,
    Player,
}

pub struct ZoneTemplate {
    pub id: ZoneId,
    pub name: String,
    pub owner_type: ZoneOwner,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Ruleset {
    pub player_range: Range<u32>,
    pub ruleset_name: String,
    pub layout: Layout,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Layout {}

//
// Layout (root)
// Deck
// players
//   id - 1
//   id - 2
//   id - 3
//
//   ruleset implementation goals:
//     Go Fish
//     Poker
//     Dou dizhu
//
//   Should be a tree with actions?
//   One of the most important resources in a game is a Zone
//   The game needs to act on zones => Zones should be identifiable
//   Zones will be created dynamicaly by the game interpreter
