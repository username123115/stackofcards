use serde::{Deserialize, Serialize};
pub type VarID = String;
pub type TypeID = String;

pub type Immediate = Literal;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Literal {
    Number(String),
    StringLiteral(String),
    BooleanLiteral(String),
    PlayerLiteral(String),
    ZoneLiteral(String),
    SuitLiteral(String),
    RankLiteral(String),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Expression {
    BinOp(BinOp),
    Imm(Immediate),
    Var(VarID),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BinOp {
    pub a: Box<Expression>,
    pub b: Box<Expression>,
    pub op: BinOps,
}

pub fn new_binop(a: Expression, op: BinOps, b: Expression) -> Expression {
    let body = BinOp {
        a: Box::new(a),
        b: Box::new(b),
        op,
    };
    Expression::BinOp(body)
}

#[derive(Debug, Serialize, Deserialize, Clone)]
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
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VarDecl {
    pub var_type: TypeID,
    pub var_name: VarID,
    pub value: Option<Expression>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Statement {
    Block(Block),
    Decl(VarDecl),
    Assign(Assign),
    Conditional(Conditional),
    Return,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Conditional {
    pub condition: Expression,
    pub exec_if: Block,
    pub exec_else: Option<Block>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Place {
    Var(VarID),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Assign {
    pub from: Expression,
    pub to: Place,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Block {
    pub block_type: BlockType,
    pub instructions: Vec<Statement>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum BlockType {
    Normal,
    Checkpoint,
    Context,
}

#[cfg(test)]
pub mod tests {
    use crate::ast_raw::{
        BooleanLiteralParser, ExpressionParser, LiteralParser, NumberLiteralParser,
        RankLiteralParser, SuitLiteralParser,
    };

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

    #[test]
    pub fn bool_literal() {
        assert!(BooleanLiteralParser::new().parse("true").is_ok());
        assert!(BooleanLiteralParser::new().parse("false").is_ok());
    }

    pub fn zone_literal() {
        assert!(LiteralParser::new().parse("#deck#").is_ok());
        assert!(LiteralParser::new().parse("#discardPile#").is_ok());
    }

    #[test]
    pub fn expression() {
        assert!(ExpressionParser::new().parse("variable").is_ok());
        assert!(ExpressionParser::new().parse("Hearts").is_ok());

        assert!(
            ExpressionParser::new()
                .parse("variable + other > Card")
                .is_ok()
        );
    }
}
