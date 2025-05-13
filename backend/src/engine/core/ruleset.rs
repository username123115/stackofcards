use crate::engine::core::cards;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

// Data oriented serializable structure that can be
//

pub type ZoneId = String;
pub type ZoneInstanceId = String;

pub type StageId = String;
pub type Tag = String;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Ruleset {
    pub player_range: Range<u32>,
    pub cards: CardList,
    pub zone_templates: HashMap<ZoneId, ZoneTemplate>, // zones
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum BuiltinCardList {
    All,
    None,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum CardList {
    Builtin(BuiltinCardList),
    Custom(Vec<cards::Card>),
}

use std::ops::Range;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Owner {
    Game,
    Player,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ZoneTemplate {
    pub id: ZoneId,
    pub name: String,
    pub owner: Owner,
    pub capacity: Option<u32>,
    pub tags: HashSet<Tag>,
}

/*
    ruleset implementation goals:
      Go Fish
      Poker
      Dou dizhu

    Should be a tree with actions?
    One of the most important resources in a game is a Zone
    The game needs to act on zones => Zones should be identifiable
    Zones will be created dynamicaly by the game interpreter
    Need a Zone describer that can identify a zone

    What should the ruleset specify? What's important in a Game?

    Initial set of cards - Won't change

    Deck setup - these are a set of instructions to assign cards


    Setup steps, user


   Interpreter reads a ruleset for go fish

   Ruleset:

      ZoneDefs


      Parsed tree set up
         .deck[Zone node](tag = #deck, template = {cards: @all, init: shuffle, visibility: top})
         .players[Zone container](tag = #players, template = {tag: #deck, cards: @empty, visibility: private, owner: @future}


   Init:

   Create a deck: +Zone tag: #deck; cards: @all
   Tree:
     #deck {2C, 2D, 2H, 2S, ..., AS}
     #player []

   range 2-5

   four players join

   Ruleset Builtin utilities (@)
   @all : cardset -> represents all 52 playing cards

   User input:

   Tree structure:
   Immutable tree defined at the beginning, each node can point to another node or a zone
   container as their children

 rule layer dictates further restrictions on handling cards and zones defined in card layer




 General ideas

 Assumptions: Sequential play, players play in order one by one / only ask for one player to make
 a move at a time

 Continuation: Support playing up until card exhaustion



 Engine ideas

 Conditions: Win, Tie, Draw, Abort



 Continuation - Exits: Can the game continue if a player leaves?
 U


*/

/*
* Card DSL
*
*
*
* Variables: During set up and other phases variables get initialized
* Zone Variables: Zone Template defines types, the interpreter will ask for a zone ID when
*   - api
*     - Templates
*       - @DefineZone id ...args (Declare a new zone template, maps ) see ZoneTemplate
*      - Zone Variables
*       - @NewZone id
*
* Player Variables:
*
*   - User uses api
*   - '@declare deck id' -> Game will map a new variable called 'deck'
*   - API: Expose zone `pick` and `add`,
*   -
* Player Variables:
*
* instructions
* @NewZone create a zone from an existing template
* @SetMode change how tunrs work TODO implement later
*
*/

enum RulesetMode {
    Sequential,
    // TODO: Add simultaneous for something like rummy, but I haven't worked out requirements
}

enum Instruction {
    NewZone { id: ZoneId },
    //DefineZone { zone: ZoneTemplate },
    SetMode { mode: RulesetMode },
    EnterCheckpoint,
    ExitCheckpoint,
    Equal,
    Return,
}

enum PlayerSpecifier {}
