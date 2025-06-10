use super::types_instances::BaseNumberType;
use crate::engine::core::types;

// Get evaluated to types
#[derive(Debug, Clone)]
pub enum Expression {
    Number(NumberExpression),
    Boolean(BooleanExpression),
    Zone(ZoneExpression),
    ZoneCollection(ZoneCollectionExpression),
    Player(PlayerExpression),
    PlayerCollection(PlayerCollectionExpression),
    Suit(SuitExpression),
    Rank(RankExpression),
    CardSelector(CardSelectorExpression),
}

#[derive(Debug, Clone)]
pub enum CardSelectorExpression {
    Top,
    Bottom,
    Suit(SuitExpression),
    Rank(RankExpression),
}

#[derive(Debug, Clone)]
pub enum SuitExpression {
    SuitLiteral(types::cards::Suit),
}

#[derive(Debug, Clone)]
pub enum RankExpression {
    RankLiteral(types::cards::Rank),
}

#[derive(Debug, Clone)]
pub enum NumberExpression {
    NumberLiteral(BaseNumberType),
    SumZones {
        //Take the sum of a zone
        zone: types::zones::SingleZoneTarget,
        ordering: types::cards::RankOrder,
    },
}

#[derive(Debug, Clone)]
pub enum BooleanExpression {
    BooleanLiteral(bool),
    Comparison {
        a: Box<NumberExpression>,
        compared_to: Comparison,
        b: Box<NumberExpression>,
    },
}

#[derive(Debug, Clone)]
pub enum Comparison {
    GT,
    LT,
    GTE,
    LTE,
    Eq,
}

#[derive(Debug, Clone)]
pub enum ZoneExpression {
    SingleZone(types::zones::SingleZoneTarget),
}

#[derive(Debug, Clone)]
pub enum ZoneCollectionExpression {
    ZoneCollection(types::zones::ZoneTarget),
}

#[derive(Debug, Clone)]
pub enum PlayerExpression {
    Player(types::players::SinglePlayerTarget),
}

#[derive(Debug, Clone)]
pub enum PlayerCollectionExpression {
    PlayerCollection(types::players::PlayerTarget),
}
