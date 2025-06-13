use super::{
    config,
    lang::{expressions, phases, statements, types_instances},
    state,
};

use tracing;

use crate::engine::core::types::{cards, identifiers::*, patterns, players, zones};

use std::collections::{HashMap, HashSet};
use std::sync::Arc;

#[derive(Debug, Clone)]
pub enum GameError {
    Fatal(FatalGameError),
    Recoverable(RecoverableGameError),
}

#[derive(Debug, Clone)]
pub enum FatalGameError {
    StateRuntime(state::RuntimeError),
}

#[derive(Debug, Clone)]
pub enum RecoverableGameError {
    WrongStatus,
}

pub fn state_error_to_game(state_error: state::StateMethodError) -> GameError {
    match state_error {
        state::StateMethodError::WrongStatus => {
            GameError::Recoverable(RecoverableGameError::WrongStatus)
        }
        state::StateMethodError::InternalError(e) => {
            GameError::Fatal(FatalGameError::StateRuntime(e))
        }
    }
}

pub enum NonFatalGameError {}

#[derive(Debug, Clone)]
pub struct ExecutionContext {
    statements_evaluated: u64,
    statement_limit: u64,
}

impl ExecutionContext {
    pub fn new() -> Self {
        Self {
            statements_evaluated: 0,
            statement_limit: 1000,
        }
    }
}

#[derive(Debug, Clone)]
pub struct Game {
    config: Arc<config::GameConfig>,
    state: state::GameState,
    ex_ctx: ExecutionContext,
}

impl Game {
    pub fn new(config: config::GameConfig) -> Self {
        let config_rc = Arc::new(config);
        Self {
            config: config_rc.clone(),
            state: state::GameState::new(config_rc),
            ex_ctx: ExecutionContext::new(),
        }
    }

    pub fn get_status(&self) -> state::GameStatus {
        self.state.status.clone()
    }

    pub fn is_waiting(&self) -> bool {
        if let state::GameStatus::Waiting(_) = self.get_status() {
            return true;
        }
        false
    }

    pub fn is_ready(&self) -> bool {
        self.state.game_ready()
    }

    pub fn update_players(&mut self, player_count: u64) -> Result<(), String> {
        self.state.create_players(player_count)
    }

    pub fn get_roles(&self) -> Vec<PlayerClassIdentifier> {
        self.state.players.clone()
    }

    // Identify zones by owner (Players will hold references)
    // Identify zones by class
    //

    pub fn init(&mut self) {}

    pub fn lookup_single_zone(&self, target: &zones::SingleZoneTarget) -> VariableIdentifier {
        todo!("IMPLEMENT ME");
    }

    pub fn lookup_multi_zone(&self, target: &zones::MultiZoneTarget) -> Vec<VariableIdentifier> {
        todo!("IMPLEMENT ME");
    }

    pub fn lookup_zones(&self, target: &zones::ZoneTarget) -> Vec<VariableIdentifier> {
        match target {
            zones::ZoneTarget::Single(s) => vec![self.lookup_single_zone(s)],
            zones::ZoneTarget::Multiple(m) => self.lookup_multi_zone(m),
        }
    }

    pub fn lookup_single_player(&self, target: &players::SinglePlayerTarget) -> VariableIdentifier {
        todo!("IMPLEMENT ME");
    }

    pub fn lookup_multi_players(
        &self,
        target: &players::MultiPlayerTarget,
    ) -> Vec<VariableIdentifier> {
        todo!("IMPLEMENT ME");
    }

    pub fn lookup_players(&self, target: &players::PlayerTarget) -> Vec<VariableIdentifier> {
        match target {
            players::PlayerTarget::Single(s) => vec![self.lookup_single_player(s)],
            players::PlayerTarget::Multiple(m) => self.lookup_multi_players(m),
        }
    }

    pub fn on_reached_eval_limit(&mut self) {
        self.throw_error("Evaluation limit reached".into());
    }

    pub fn throw_error(&mut self, reason: String) {}

    pub fn evaluate_statement(&mut self, statement: &statements::Statement) {
        self.ex_ctx.statements_evaluated += 1;
        if self.ex_ctx.statements_evaluated > self.ex_ctx.statement_limit {
            self.on_reached_eval_limit();
            return;
        }
    }

    pub fn evaluate_number(
        &self,
        expr: &expressions::NumberExpression,
    ) -> types_instances::BaseNumberType {
        use expressions::NumberExpression::*;
        match expr {
            Literal(n) => *n,
            SumZones { zone, ordering } => todo!("IMPLEMENT ME"),
        }
    }

    pub fn evaluate_bool(&self, expr: &expressions::BooleanExpression) -> bool {
        use expressions::BooleanExpression::*;
        match expr {
            Literal(b) => *b,
            Comparison { a, compared_to, b } => {
                let va = self.evaluate_number(a);
                let vb = self.evaluate_number(b);
                use expressions::Comparison::*;
                match compared_to {
                    GT => va > vb,
                    LT => va < vb,
                    GTE => va >= vb,
                    LTE => va <= vb,
                    Eq => va == vb,
                }
            }
        }
    }

    pub fn evaluate_zone(&self, expr: &expressions::ZoneExpression) -> VariableIdentifier {
        use expressions::ZoneExpression::*;
        match expr {
            SingleZone(z) => self.lookup_single_zone(z),
        }
    }

    pub fn evaluate_zone_collection(
        &self,
        expr: &expressions::ZoneCollectionExpression,
    ) -> Vec<VariableIdentifier> {
        use expressions::ZoneCollectionExpression::*;
        match expr {
            ZoneCollection(zt) => self.lookup_zones(zt),
        }
    }

    pub fn evaluate_player(&self, expr: &expressions::PlayerExpression) -> VariableIdentifier {
        use expressions::PlayerExpression::*;
        match expr {
            Player(p) => self.lookup_single_player(p),
        }
    }

    pub fn evaluate_player_collection(
        &self,
        expr: &expressions::PlayerCollectionExpression,
    ) -> Vec<VariableIdentifier> {
        use expressions::PlayerCollectionExpression::*;
        match expr {
            PlayerCollection(pt) => self.lookup_players(pt),
        }
    }
}
