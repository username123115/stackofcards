use super::types_instances::BaseNumberType;
use crate::engine::core::types;

// Get evaluated to types
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

pub enum CardSelectorExpression {
    Top,
    Bottom,
    Suit(SuitExpression),
    Rank(RankExpression),
}

pub enum SuitExpression {
    SuitLiteral(types::cards::Suit),
}

pub enum RankExpression {
    RankLiteral(types::cards::Rank),
}

pub enum NumberExpression {
    NumberLiteral(BaseNumberType),
    SumZones {
        //Take the sum of a zone
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
    ZoneCollection(types::zones::ZoneTarget),
}

pub enum PlayerExpression {
    Player(types::players::SinglePlayerTarget),
}

pub enum PlayerCollectionExpression {
    PlayerCollection(types::players::PlayerTarget),
}
