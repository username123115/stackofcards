use crate::engine::core::cards;
//use crate::engine::core::dsl::ast_typed::*;

use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::ops::Range;

// Data oriented serializable structure that can be
//

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Ruleset {
    pub player_range: Range<u32>,
}
