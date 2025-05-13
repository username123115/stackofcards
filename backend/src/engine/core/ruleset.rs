use crate::engine::core::cards;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

// Data oriented serializable structure that can be
//

pub type ZoneId = String;
pub type ZoneInstanceId = String;
pub type PlayerInstanceId = String;

pub type DSLVariableId = String;

pub type StageId = String;
pub type Tag = String;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CardSet {
    suits: HashSet<cards::Suit>,
    ranks: HashSet<cards::Rank>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Ruleset {
    pub player_range: Range<u32>,
    pub starting_cards: CardSet,
    pub zone_templates: HashMap<ZoneId, ZoneTemplate>, // zones
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

pub struct PlayerTemplate {
    // zone name to a finished Zone, the interpreter will make a concrete player that maps these to finished zones
    pub zones: HashMap<String, ZoneId>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
enum RulesetMode {
    Sequential,
    // TODO: Add simultaneous for something like rummy, but I haven't worked out requirements
}

// Everything we expose to our user, internal features like Zone info are set behind references
#[derive(Debug, Serialize, Deserialize, Clone)]
enum DSLValue {
    Var(DSLVariableId),
    Imm(DSLTypeInstance),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
enum DSLTypeInstance {
    Number(Option<u32>),
    Rank(Option<cards::Rank>),
    Suit(Option<cards::Suit>),
    ZoneRef(Option<ZoneInstanceId>),
    PlayerRef(Option<PlayerInstanceId>),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
enum Instruction {
    SetMode { mode: RulesetMode },
    Block(Block),

    Assign { src: DSLValue, dst: DSLVariableId },

    Equal,
    Return,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Block {
    variables: HashMap<DSLVariableId, DSLValue>,
    block_type: BlockType,
    instructions: Vec<Instruction>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
enum BlockType {
    Normal,
    Checkpoint,
    Context,
}

struct Conditional {
    condition: Condition,
    left: DSLValue,
    right: DSLValue,

    exec_if: Block,
    exec_else: Option<Block>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
enum Condition {
    Equals,
    GreaterThan,
    GreaterThanEqual,
    LessThan,
    LessThanEqual,
    NotEquals,
}

enum PlayerSpecifier {}

mod example {
    use super::*;

    fn go_fish() {
        let suits: HashSet<cards::Suit> = HashSet::from_iter(cards::Suit::all());
        let ranks: HashSet<cards::Rank> = HashSet::from_iter(cards::Rank::all());
        let starters = CardSet { suits, ranks };
        let player_range: Range<u32> = 2..5;

        let public_deck: ZoneTemplate = ZoneTemplate {
            id: String::from("go_fish:template_public_deck"),
            name: String::from("public_deck"),
            owner: Owner::Game,
            capacity: Some(52),
            tags: HashSet::new(),
        };

        let player_deck: ZoneTemplate = ZoneTemplate {
            id: String::from("go_fish:template_player_deck"),
            name: String::from("player_deck"),
            owner: Owner::Player,
            capacity: None,
            tags: HashSet::new(),
        };

        let mut var_mappings: HashMap<String, ZoneId> = HashMap::new();
        var_mappings.insert(player_deck.name.clone(), player_deck.id.clone());

        let player_def = PlayerTemplate {
            zones: var_mappings,
        };
    }
}
