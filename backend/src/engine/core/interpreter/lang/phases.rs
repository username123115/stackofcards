use super::statements;

use serde::{Deserialize, Serialize};
use ts_rs::TS;

use std::sync::Arc;

#[derive(TS, Debug, Serialize, Deserialize, Clone)]
#[ts(export)]
pub struct Phase {
    pub evaluate: Arc<statements::Statement>,
}
