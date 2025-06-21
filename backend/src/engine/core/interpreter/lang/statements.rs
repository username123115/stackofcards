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
    While {
        condition: Box<expressions::BooleanExpression>,
        r#do: Box<Statement>,
    },
    Broadcast {
        msg: String,
        to: Box<expressions::PlayerCollectionExpression>,
    },
    DeclareWinner(Box<expressions::PlayerCollectionExpression>),
    SetNumber {
        name: String,
        value: Box<expressions::NumberExpression>,
    },
    AdvancePlayerStateByType {
        to_advance: Box<expressions::NumberExpression>,
        type_name: String,
    },
    AdvancePlayerState(Box<expressions::NumberExpression>),
    MoveCardsTo {
        source: Box<expressions::CardCollectionExpression>,
        dest: Box<expressions::ZoneExpression>,
    },
    GenerateCards {
        cards: Box<expressions::CardSetExpression>,
        dest: Box<expressions::ZoneExpression>,
    },
    Deal {
        num_cards: Box<expressions::NumberExpression>,
        source: Box<expressions::ZoneExpression>,
        dest: Box<expressions::ZoneCollectionExpression>,
    },
    Shuffle(Box<expressions::ZoneCollectionExpression>),
    EnterPhase(String),
    Offer(Offer),
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct ConditionalStatement {
    pub condition: Box<expressions::BooleanExpression>,
    pub go_true: Box<Statement>,
    pub go_false: Box<Statement>,
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct Offer {
    player_name: Option<String>,
    offer_to: Box<expressions::PlayerCollectionExpression>,
    cases: Vec<OfferCase>,
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct OfferCase {
    condition: Option<Box<expressions::BooleanExpression>>,
    choices: Vec<OfferChoice>,
    message: String,
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum OfferChoice {
    Selection(ChoiceSelection),
    Action(ChoiceAction),
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct ChoiceSelection {
    name: String,
    choice_type: ChoiceSelectionEnum,
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum ChoiceAction {
    MoveCards {
        from: Box<expressions::ZoneExpression>,
        to: Box<expressions::ZoneExpression>,
    },
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub enum ChoiceSelectionEnum {
    Player(Box<expressions::PlayerCollectionExpression>),
    PlayerSelection(Box<expressions::PlayerCollectionExpression>),
    Card(Box<expressions::CardCollectionExpression>),
    CardSelection(Box<expressions::CardCollectionExpression>),
}
