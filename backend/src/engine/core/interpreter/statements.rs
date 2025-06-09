use super::expressions;
use crate::engine::core::types::{cards, identifiers::*, patterns, players, zones};

pub enum Statement {
    Empty,
    Block(Vec<Statement>),
    Conditional(ConditionalStatement), //if else block
    Broadcast {
        msg: String,
        to: players::PlayerTarget,
    },
    CreateCards {
        zone: zones::ZoneTarget,
        cards: cards::CardSet,
    },
    Deal {
        //For now just do round robin dealing of count cards each, and error if theres not
        //enough cards
        from: zones::SingleZoneTarget,
        to: zones::ZoneTarget,
        count: u64,
    },
    Move {
        from: players::SinglePlayerTarget,
        to: zones::SingleZoneTarget,
        selector: zones::CardSelector,
    },
}

pub struct ConditionalStatement {
    pub condition: expressions::BooleanExpression,
    pub go_true: Box<Statement>,
    pub go_false: Box<Statement>,
}
