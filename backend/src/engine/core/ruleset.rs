use serde::{Deserialize, Serialize};
use std::ops::Range;

// Data oriented serializable structure that can be
//

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Ruleset {
    pub player_range: Range<u32>,
}
