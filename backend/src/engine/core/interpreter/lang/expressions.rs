use super::types_instances::BaseNumberType;
use crate::engine::core::types::*;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

// Get evaluated to types
#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum Expression {
    CardSet(CardSetExpression),
    Order(OrderExpression),
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
pub enum CardSetExpression {
    AllAllowed,
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum OrderExpression {
    GetVariable(String),
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum CardExpression {
    Create(Box<SuitExpression>, Box<RankExpression>),
    GetVariable(String),
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum CardCollectionExpression {
    Single(Box<CardExpression>),
    GetVariable(String),
    AllInZone(Box<ZoneExpression>),
    TopInZone(Box<ZoneExpression>),
    BottomInZone(Box<ZoneExpression>),
    InZoneMatchingSuit {
        zone: Box<ZoneExpression>,
        suit: Box<SuitExpression>,
    },
    InZoneMatchingRank {
        zone: Box<ZoneExpression>,
        rank: Box<RankExpression>,
    },
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
    GetVariable(String),
    CardsIn(Box<CardCollectionExpression>),
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
    PlayerIsType {
        player: Box<PlayerExpression>,
        type_name: String,
    },
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum Comparison {
    GT,
    LT,
    GTE,
    LTE,
    EQ,
    NEQ,
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum ZoneExpression {
    OwnedByPlayer {
        player: Box<PlayerExpression>,
        zone_name: String,
    },
    GetVariable(String),
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum ZoneCollectionExpression {
    Single(Box<ZoneExpression>),
    OfType(String),
    GetVariable(String),
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum PlayerExpression {
    CurrentPlayer,
    GetVariable(String),
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum PlayerCollectionExpression {
    Single(Box<PlayerExpression>),
    AllPlayers,
    GetVariable(String),
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum CardSelectorExpression {
    Top,
    Bottom,
    Suit(SuitExpression),
    Rank(RankExpression),
}
