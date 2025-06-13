use super::expressions;
use crate::engine::core::types::{cards, identifiers::*, patterns, players, zones};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum Statement {
    Empty,
    Block(Vec<Statement>),
    Conditional(ConditionalStatement), //if else block
    Broadcast {
        msg: String,
        to: expressions::PlayerCollectionExpression,
    },
    CreateCards {
        zone: expressions::ZoneExpression,
        cards: cards::CardSet,
    },
    Deal {
        //For now just do round robin dealing of count cards each, and error if theres not
        //enough cards
        from: expressions::ZoneExpression,
        to: expressions::ZoneCollectionExpression,
        count: u64,
    },
    Move {
        from: expressions::ZoneExpression,
        to: expressions::ZoneExpression,
        selector: expressions::CardSelectorExpression,
    },
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct ConditionalStatement {
    pub condition: expressions::BooleanExpression,
    pub go_true: Box<Statement>,
    pub go_false: Box<Statement>,
}
