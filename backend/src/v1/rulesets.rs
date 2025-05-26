use axum::Json;

use serde::{Deserialize, Serialize};
use ts_rs::TS;

pub type RulesetIdentifier = u64;

#[derive(TS, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct RulesetDescriber {
    pub name: String,
    pub description: String,
    pub identifier: RulesetIdentifier,
}

//TODO: Pending the DSL becoming complete, a Rust implementation of Go Fish will be used regardless
//of game

pub fn get_rulesets() -> Vec<RulesetDescriber> {
    let examples: [RulesetDescriber; 5] = [
        RulesetDescriber {
            name: String::from("Go Fish"),
            description: String::from("Simple matching card game."),
            identifier: 101,
        },
        RulesetDescriber {
            name: String::from("Poker"),
            description: String::from("Betting and strategy card game."),
            identifier: 102,
        },
        RulesetDescriber {
            name: String::from("Blackjack"),
            description: String::from("Aim for 21 without going over."),
            identifier: 103,
        },
        RulesetDescriber {
            name: String::from("Solitaire"),
            description: String::from("Single-player card game."),
            identifier: 104,
        },
        RulesetDescriber {
            name: String::from("Bridge"),
            description: String::from("Partnership trick-taking card game."),
            identifier: 105,
        },
    ];
    Vec::from(examples)
}

pub async fn get() -> Json<Vec<RulesetDescriber>> {
    Json(get_rulesets())
}
