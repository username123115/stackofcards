use chrono::{DateTime, Utc};
use uuid;

use std::ops::Range;

pub struct Ruleset {
    player_range: Range<u32>,
}
