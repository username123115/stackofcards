use super::common;
use crate::engine::core::interpreter::config;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct GameInfo {
    pub code: u64,
}
pub type RulesetIdentifier = u64;

//DEPRECATE ME
#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct RulesetContents {
    pub config: config::GameConfig,
    pub title: String,
    pub description: String,
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct RulesetPreview {
    pub title: String,
    pub description: String,
    pub author_id: String,
    pub author_name: String,
    pub based_on: Option<String>,
    pub ruleset_id: String,
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct RulesetListing {
    pub total: u32,
    pub pagination: common::Pagination,
    pub contents: Vec<RulesetPreview>,
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct RulesetDescriber {
    pub name: String,
    pub description: String,
    pub identifier: RulesetIdentifier,
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct GameCreateRequest {
    pub id: RulesetIdentifier,
}

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct RulesetResult {
    pub ruleset_id: String,
}
