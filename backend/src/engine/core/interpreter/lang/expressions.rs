use super::types_instances::BaseNumberType;
use crate::engine::core::types::*;

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
pub enum CardExpression {
    Create(Box<SuitExpression>, Box<RankExpression>),
}

#[derive(Debug, Clone)]
pub enum SuitExpression {
    Literal(suits::Suit),
    FromCard(CardExpression),
}

#[derive(Debug, Clone)]
pub enum RankExpression {
    Literal(ranks::Rank),
    FromCard(CardExpression),
}

#[derive(Debug, Clone)]
pub enum NumberExpression {
    Literal(BaseNumberType),
    SumZones {
        //Take the sum of a zone
        zone: zones::SingleZoneTarget,
        ordering: rank_order::RankOrder,
    },
}

#[derive(Debug, Clone)]
pub enum BooleanExpression {
    Literal(bool),
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
    SingleZone(zones::SingleZoneTarget),
}

#[derive(Debug, Clone)]
pub enum ZoneCollectionExpression {
    ZoneCollection(zones::ZoneTarget),
}

#[derive(Debug, Clone)]
pub enum PlayerExpression {
    Player(players::SinglePlayerTarget),
}

#[derive(Debug, Clone)]
pub enum PlayerCollectionExpression {
    PlayerCollection(players::PlayerTarget),
}

#[derive(Debug, Clone)]
pub enum CardSelectorExpression {
    Top,
    Bottom,
    Suit(SuitExpression),
    Rank(RankExpression),
}
