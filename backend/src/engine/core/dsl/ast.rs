use crate::engine::core::cards;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

pub type ZoneId = String;
pub type ZoneInstanceId = String;
pub type PlayerInstanceId = String;

pub type DSLVariableId = String;

pub type StageId = String;
pub type Tag = String;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CardSet {
    pub suits: HashSet<cards::Suit>,
    pub ranks: HashSet<cards::Rank>,
}

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
pub enum DSLValue {
    Var(DSLVariableId),
    Imm(DSLTypeInstance),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum DSLTypeInstance {
    Number(Option<i32>),
    Rank(Option<cards::Rank>),
    Suit(Option<cards::Suit>),
    ZoneRef(Option<ZoneInstanceId>),
    PlayerRef(Option<PlayerInstanceId>),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Instruction {
    SetMode { mode: RulesetMode },
    Block(Block),

    Assign { src: DSLValue, dst: DSLVariableId },

    Equal,
    Return,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum BlockType {
    Normal,
    Checkpoint,
    Context,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Condition {
    Equals,
    GreaterThan,
    GreaterThanEqual,
    LessThan,
    LessThanEqual,
    NotEquals,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Conditional {
    pub condition: Condition,
    pub left: DSLValue,
    pub right: DSLValue,

    pub exec_if: Block,
    pub exec_else: Option<Block>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Block {
    variables: HashMap<DSLVariableId, DSLTypeInstance>,
    block_type: BlockType,
    instructions: Vec<Instruction>,
}

// A further pass will move these into the Block variables
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VariableDeclaration {
    pub name: String,
    pub value: DSLTypeInstance,
}

#[cfg(test)]
pub mod tests {
    use crate::grammar::VariableDeclParser;

    #[test]
    pub fn declare_variables() {
        assert!(
            VariableDeclParser::new()
                .parse("let myNumber : Number = 5;")
                .is_ok()
        );
        assert!(
            VariableDeclParser::new()
                .parse("let mySuit : Suit = Hearts;")
                .is_ok()
        );

        assert!(
            VariableDeclParser::new()
                .parse("let myRank : Rank = Ace;")
                .is_ok()
        );

        assert!(
            VariableDeclParser::new()
                .parse("let deck : Zone = #deck#;")
                .is_ok()
        );

        assert!(
            VariableDeclParser::new()
                .parse("let player0 : Player = `soc_player_0`;")
                .is_ok()
        );
    }
}
