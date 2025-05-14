pub type VarID = String;
pub type TypeID = String;

pub type Immediate = Literal;

pub enum Literal {
    Number(String),
    StringLiteral(String),
    BooleanLiteral(String),
    PlayerLiteral(String),
    ZoneLiteral(String),
    SuitLiteral(String),
    RankLiteral(String),
}

pub enum Expression {
    BinOp(BinOp),
    Imm(Immediate),
    Var(VarID),
}

pub struct BinOp {
    pub a: Box<Expression>,
    pub b: Box<Expression>,
    pub op: BinOps,
}

pub enum BinOps {
    GreaterThan,
    GreaterEqual,
    LesserThan,
    LesserEqual,
    Equal,
    Add,
    Subtract,
    Multiply, //Surely nobody would need to divide numbers to describe a card game
}

// let name : type = expression
pub struct VarDecl {
    pub var_type: TypeID,
    pub value: Option<Expression>,
}

pub enum Statement {
    Block(Block),
    Decl(VarDecl),
    Assign(Assign),
    Conditional(Conditional),
    Return,
}

pub struct Conditional {
    pub condition: Expression,
    pub exec_if: Block,
    pub exec_else: Option<Block>,
}

pub enum Place {
    Var(VarID),
}

pub struct Assign {
    pub from: Expression,
    pub to: Place,
}

pub struct Block {
    pub block_type: BlockType,
    pub instructions: Vec<Statement>,
}

pub enum BlockType {
    Normal,
    Checkpoint,
    Context,
}

#[cfg(test)]
pub mod tests {
    use crate::ast_raw::{NumberLiteralParser, RankLiteralParser, SuitLiteralParser};

    //TODO: Surely this construction can be automated
    #[test]
    pub fn rank_literal() {
        assert!(RankLiteralParser::new().parse("King").is_ok());
        assert!(RankLiteralParser::new().parse("Ace").is_ok());
        assert!(RankLiteralParser::new().parse("Seven").is_ok());
    }

    #[test]
    pub fn suit_literal() {
        assert!(SuitLiteralParser::new().parse("Hearts").is_ok());
        assert!(SuitLiteralParser::new().parse("Diamonds").is_ok());
        assert!(SuitLiteralParser::new().parse("Clubs").is_ok());
    }

    #[test]
    pub fn number_literal() {
        assert!(NumberLiteralParser::new().parse("-324").is_ok());
        assert!(NumberLiteralParser::new().parse("0").is_ok());
        assert!(NumberLiteralParser::new().parse("51x191").is_err());
    }
}
