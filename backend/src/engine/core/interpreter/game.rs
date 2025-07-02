use super::{
    config,
    lang::{expressions, phases, statements, types_instances},
    state::{execution_state, game_state},
};

use crate::engine::core::types::*;
use execution_state::ExecutionState;
use identifiers::*;
use statements::Statement;

use std::sync::Arc;
use thiserror::Error;

#[derive(Error, Debug, Clone)]
pub enum GameError {
    #[error("Game encountered an error that can't be recovered from")]
    Fatal(#[from] FatalGameError),
    #[error("Game encountered an error that is recoverable")]
    Recoverable(#[from] RecoverableGameError),
}

#[derive(Error, Debug, Clone)]
pub enum FatalGameError {
    #[error("State is corrupted")]
    StateRuntime(#[from] game_state::StateModifyError),
}

#[derive(Error, Debug, Clone)]
pub enum RecoverableGameError {
    #[error("Game in wrong status")]
    WrongStatus,
}

pub fn state_error_to_game(state_error: game_state::StateError) -> GameError {
    match state_error {
        game_state::StateError::WrongStatus => {
            GameError::Recoverable(RecoverableGameError::WrongStatus)
        }
        game_state::StateError::Modify(e) => GameError::Fatal(FatalGameError::StateRuntime(e)),
    }
}

pub enum NonFatalGameError {}

pub enum EngineStatus {
    Finished,
    Ready,
    Sleep(u32),
    Broadcast(String),
}

#[derive(Error, Debug)]
pub enum ExecutionError {
    #[error("Executor instruction state became corrupted")]
    ExecutionState(#[from] execution_state::ExecutionStateError),
}

pub fn wrap_exec_state_error(e: execution_state::ExecutionStateError) -> ExecutionError {
    ExecutionError::ExecutionState(e)
}

#[derive(Debug, Clone)]
pub struct Game {
    config: Arc<config::GameConfig>,
    state: game_state::GameState,
    ex_state: ExecutionState,
}

impl Game {
    pub fn new(config: config::GameConfig) -> Self {
        let config_rc = Arc::new(config);
        //TODO: return error
        let root_phase = config_rc
            .clone()
            .phases
            .get(&config_rc.clone().initial_phase)
            .unwrap()
            .evaluate
            .clone();
        Self {
            config: config_rc.clone(),
            state: game_state::GameState::new(config_rc),
            ex_state: ExecutionState::new(root_phase),
        }
    }

    pub fn eval_statement(&mut self) -> Result<EngineStatus, ExecutionError> {
        match self.ex_state.get_current_statement() {
            None => Ok(EngineStatus::Finished),
            Some(statement) => {
                let mut status = EngineStatus::Ready;
                match &*statement {
                    Statement::Empty => status = EngineStatus::Ready,
                    Statement::Block(_stmts) => {
                        self.ex_state
                            .upgrade_statement()
                            .map_err(wrap_exec_state_error)?;
                    }
                    Statement::Conditional(cond_statement) => {
                        let condition = self.evaluate_bool(&cond_statement.condition);
                        let statement_to_execute = match condition {
                            true => cond_statement.go_true.clone(),
                            false => cond_statement.go_false.clone(),
                        };
                        self.ex_state
                            .incr_and_push(statement_to_execute, 1)
                            .map_err(wrap_exec_state_error)?;
                    }
                    Statement::While { condition, r#do } => {
                        let valid = self.evaluate_bool(&condition);
                        if valid {
                            self.ex_state.push_statement(r#do.clone());
                        }
                    }
                    //TODO
                    Statement::Broadcast { msg, to } => {
                        status = EngineStatus::Broadcast(msg.clone());
                    }
                    Statement::DeclareWinner(player) => todo!("impl"),
                    Statement::SetNumber { name, value } => todo!("impl"),
                    Statement::AdvancePlayerStateByType {
                        to_advance,
                        type_name,
                    } => todo!("impl"),
                    Statement::AdvancePlayerState(to_advance) => todo!("impl"),
                    Statement::MoveCardsTo { source, dest } => todo!("impl"),

                    Statement::GenerateCards { cards, dest } => todo!("impl"),
                    Statement::Deal {
                        num_cards,
                        source,
                        dest,
                    } => todo!("impl"),

                    Statement::Shuffle(zones) => todo!("impl"),
                    Statement::EnterPhase(pname) => todo!("impl"),
                    Statement::Offer(offer) => todo!("impl"),
                    _ => todo!("impl"),
                }

                self.ex_state
                    .incr_current(1)
                    .map_err(wrap_exec_state_error)?;
                Ok(status)
            }
        }
    }

    pub fn get_status(&self) -> game_state::GameStatus {
        self.state.status.clone()
    }

    pub fn is_waiting(&self) -> bool {
        if let game_state::GameStatus::Waiting(_) = self.get_status() {
            return true;
        }
        false
    }

    pub fn is_ready(&self) -> bool {
        self.state.game_ready()
    }

    pub fn update_players(&mut self, player_count: u32) -> Result<(), String> {
        self.state.create_players(player_count)
    }

    pub fn get_roles(&self) -> Vec<PlayerClassIdentifier> {
        self.state.players.clone()
    }

    pub fn init(&mut self) -> Result<(), GameError> {
        if !self.is_ready() {
            return Err(GameError::Recoverable(RecoverableGameError::WrongStatus));
        }
        match self.state.init_game() {
            Ok(_) => (),
            Err(e) => return Err(state_error_to_game(e)),
        };

        return Ok(());
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

    pub fn evaluate_statement(&mut self, statement: &Statement) {
        self.ex_state.statements_evaluated += 1;
        if self.ex_state.statements_evaluated > self.ex_state.statement_limit {
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
            _ => todo!("uh oh"),
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
            _ => todo!("uh oh"),
        }
    }

    pub fn evaluate_zone(&self, expr: &expressions::ZoneExpression) -> VariableIdentifier {
        use expressions::ZoneExpression::*;
        match expr {
            _ => todo!("uh oh"),
        }
    }

    pub fn evaluate_zone_collection(
        &self,
        expr: &expressions::ZoneCollectionExpression,
    ) -> Vec<VariableIdentifier> {
        use expressions::ZoneCollectionExpression::*;
        match expr {
            _ => todo!("uh oh"),
        }
    }

    pub fn evaluate_player(&self, expr: &expressions::PlayerExpression) -> VariableIdentifier {
        use expressions::PlayerExpression::*;
        match expr {
            _ => todo!("uh oh"),
        }
    }

    pub fn evaluate_player_collection(
        &self,
        expr: &expressions::PlayerCollectionExpression,
    ) -> Vec<VariableIdentifier> {
        use expressions::PlayerCollectionExpression::*;
        match expr {
            _ => todo!("uh oh"),
        }
    }
}
