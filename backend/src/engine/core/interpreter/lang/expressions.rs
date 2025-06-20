use super::types_instances::BaseNumberType;
use crate::engine::core::types::*;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

// Get evaluated to types
#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum Expression {
    Number(NumberExpression),
    Boolean(BooleanExpression),
    Zone(ZoneExpression),
    ZoneCollection(ZoneCollectionExpression),
    Player(PlayerExpression),
    PlayerCollection(PlayerCollectionExpression),
    Suit(SuitExpression),
    Rank(RankExpression),
    Card(CardExpression),
    CardCollection(CardCollectionExpression),
    CardSelector(CardSelectorExpression),
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum CardExpression {
    Create(Box<SuitExpression>, Box<RankExpression>),
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum CardCollectionExpression {}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum CardSetExpression {
    Literal(cards::CardSet),
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum SuitExpression {
    Literal(suits::Suit),
    FromCard(CardExpression),
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum RankExpression {
    Literal(ranks::Rank),
    FromCard(CardExpression),
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum NumberExpression {
    Literal(BaseNumberType),
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum BooleanExpression {
    Literal(bool),
    Comparison {
        a: Box<NumberExpression>,
        compared_to: Comparison,
        b: Box<NumberExpression>,
    },
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum Comparison {
    GT,
    LT,
    GTE,
    LTE,
    Eq,
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum ZoneExpression {}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum ZoneCollectionExpression {}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum PlayerExpression {}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum PlayerCollectionExpression {
    Single(Box<PlayerExpression>),
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum CardSelectorExpression {
    Top,
    Bottom,
    Suit(SuitExpression),
    Rank(RankExpression),
}
