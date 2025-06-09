use super::types_instances::BaseNumberType;
use crate::engine::core::types;

// Get evaluated to types
pub enum Expression {
    Number(NumberExpression),
    Boolean(BooleanExpression),
}

pub enum NumberExpression {
    NumberLiteral(BaseNumberType),
    ZoneToNumber {
        zone: types::zones::SingleZoneTarget,
        ordering: types::cards::RankOrder,
    },
}

pub enum BooleanExpression {
    BooleanLiteral(bool),
    Comparison {
        a: Box<NumberExpression>,
        compared_to: Comparison,
        b: Box<NumberExpression>,
    },
}

pub enum Comparison {
    GT,
    LT,
    GTE,
    LTE,
    Eq,
}

pub enum ZoneExpression {
    SingleZone(types::zones::SingleZoneTarget),
}

pub enum ZoneCollectionExpression {
    ZoneCollection(types::zones::MultiZoneTarget),
}

pub enum PlayerExpression {
    Player(types::players::SinglePlayerTarget),
}

pub enum PlayerCollectionExpression {
    PlayerCollection(types::players::MultiPlayerTarget),
}
