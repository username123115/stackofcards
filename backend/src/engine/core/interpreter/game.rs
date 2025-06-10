use super::{
    config,
    lang::{expressions, phases, statements, types_instances},
    state,
};

use tracing;

use crate::engine::core::types::{cards, identifiers::*, patterns, players, zones};

use std::collections::{HashMap, HashSet};
use std::rc::Rc;

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

pub struct Game {
    config: Rc<config::GameConfig>,
    state: state::GameState,
    ex_ctx: ExecutionContext,
}

impl Game {
    pub fn new(config: config::GameConfig) -> Self {
        let config_rc = Rc::new(config);
        Self {
            config: config_rc.clone(),
            state: state::GameState::new(config_rc),
            ex_ctx: ExecutionContext::new(),
        }
    }

    // Identify zones by owner (Players will hold references)
    // Identify zones by class
    //

    pub fn init(&mut self) {
        let mut zone_init_result: Result<(), String> = Ok(());
        for (zone_name, zone_class) in self.config.initial_zones.iter() {
            // Empty zone owned by nobody
            match self.state.create_zone(Vec::new(), zone_class) {
                Ok(zone_id) => (),
                Err(msg) => {
                    tracing::error!("Zone init failed {msg}");
                    zone_init_result = Err(msg);
                    break;
                }
            }
        }
        if let Err(e) = zone_init_result {
            self.throw_error(e);
            return;
        }
    }

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
            NumberLiteral(n) => *n,
            SumZones { zone, ordering } => todo!("IMPLEMENT ME"),
        }
    }

    pub fn evaluate_bool(&self, expr: &expressions::BooleanExpression) -> bool {
        use expressions::BooleanExpression::*;
        match expr {
            BooleanLiteral(b) => *b,
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
