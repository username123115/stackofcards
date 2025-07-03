use super::{game_state, var_state};
use crate::engine::core::interpreter::{config, lang::statements};
use statements::Statement;
use thiserror::Error;

use std::sync::Arc;
#[derive(Debug, Clone)]
pub struct BlockContext {
    exec_idx: u32,                   //keep private
    statements: Vec<Arc<Statement>>, //keep private
}

#[derive(Debug, Clone)]
pub struct ExecutionState {
    pub statements_evaluated: u32,
    pub statement_limit: u32,
    pub statement_stack: Vec<ExecutionContext>,
    pub current_root: Arc<Statement>,
    pub root_vars: var_state::RootVarMapping,
}

impl BlockContext {
    pub fn new(statements: Vec<Arc<Statement>>) -> Self {
        Self {
            exec_idx: 0,
            statements,
        }
    }

    pub fn incr(&mut self, delta: u32) {
        self.exec_idx += delta;
    }

    pub fn get_current(&self) -> Option<Arc<Statement>> {
        if self.exec_idx < self.statements.len() as u32 {
            return Some(self.statements[self.exec_idx as usize].clone());
        }
        None
    }

    pub fn is_finished_exec(&self) -> bool {
        self.exec_idx >= self.statements.len() as u32
    }

    pub fn next_statement(&mut self) -> bool {
        if self.is_finished_exec() {
            return true;
        } else {
            self.exec_idx += 1;
            return self.is_finished_exec();
        }
    }
}

#[derive(Debug, Clone)]
pub enum StatementPointer {
    Single(Arc<Statement>),
    Block(BlockContext),
}

#[derive(Debug, Clone)]
pub struct ExecutionContext {
    pub location: StatementPointer,
    pub variables: var_state::VarMapping,
}

impl ExecutionContext {
    pub fn new(location: StatementPointer) -> Self {
        Self {
            location,
            variables: var_state::VarMapping::new(),
        }
    }
}

#[derive(Error, Debug, Clone)]
pub enum ExecutionStateError {
    #[error("Execution has finished")]
    OutOfStatements,
    #[error("Statement was of wrong type")]
    IncorrectVariant,
    #[error("Statement did not refer to a block")]
    WrongStatementPointer,
    #[error("Unable to init state")]
    InitFailure,
}

impl ExecutionState {
    pub fn new(current_root: Arc<Statement>) -> Self {
        let mut r = Self {
            statements_evaluated: 0,
            statement_limit: 1000,
            statement_stack: Vec::new(),
            current_root,
            root_vars: var_state::RootVarMapping::new(),
        };
        r.push_statement(r.current_root.clone());
        r
    }

    pub fn init(
        &mut self,
        config: &config::GameConfig,
        state: &game_state::GameState,
    ) -> Result<(), ExecutionStateError> {
        for nvar in &config.numbers {
            self.root_vars.number.insert(nvar.clone(), 0);
        }

        for (zvar, _) in &config.initial_zones {
            let zone_ref_opt = state.get_zone_by_name(zvar);
            match zone_ref_opt {
                Some(r) => {
                    self.root_vars.zone.insert(zvar.clone(), r.clone());
                }
                None => return Err(ExecutionStateError::InitFailure),
            }
        }
        Ok(())
    }

    pub fn get_current_statement(&mut self) -> Option<Arc<Statement>> {
        let mut pop_stack: bool = false;
        let result = match self.statement_stack.last() {
            Some(instr) => match &instr.location {
                StatementPointer::Single(s) => Some(s.clone()),
                StatementPointer::Block(bctx) => {
                    if let Some(cb) = bctx.get_current() {
                        Some(cb)
                    } else {
                        pop_stack = true;
                        None
                    }
                }
            },
            None => None,
        };
        if pop_stack {
            self.statement_stack.pop();
            return self.get_current_statement();
        } else {
            result
        }
    }

    pub fn upgrade_statement(&mut self) -> Result<(), ExecutionStateError> {
        let target = self.get_current_statement();
        match target {
            None => Err(ExecutionStateError::OutOfStatements),
            Some(stmt) => match &*stmt {
                Statement::Block(v) => {
                    let replace = self.statement_stack.pop();
                    let new_ctx = StatementPointer::Block(BlockContext::new(v.clone()));

                    match replace {
                        Some(mut ec) => {
                            ec.location = new_ctx;
                            self.statement_stack.push(ec);
                        }
                        None => {
                            self.statement_stack.push(ExecutionContext::new(new_ctx));
                        }
                    }

                    Ok(())
                }
                _ => Err(ExecutionStateError::IncorrectVariant),
            },
        }
    }

    //this is only really intended for incr = 0 and 1, effects the top of stack only
    pub fn incr_current(&mut self, incr: u32) -> Result<(), ExecutionStateError> {
        if incr == 0 {
            return Ok(());
        }
        let mut pop_stack: bool = false;
        let _ = self.upgrade_statement();
        match self.statement_stack.last_mut() {
            None => return Ok(()),
            Some(sp) => {
                match &mut sp.location {
                    StatementPointer::Single(stmt) => {
                        if let Statement::Block(_) = &*stmt.clone() {
                            return Err(ExecutionStateError::WrongStatementPointer);
                        }
                        pop_stack = true;
                    }
                    StatementPointer::Block(blk) => blk.incr(incr),
                };
            }
        };
        if pop_stack {
            self.statement_stack.pop();
        }
        Ok(())
    }

    pub fn incr_and_push(
        &mut self,
        statement: Arc<Statement>,
        incr: u32,
    ) -> Result<(), ExecutionStateError> {
        let r = self.incr_current(incr);
        self.statement_stack
            .push(ExecutionContext::new(StatementPointer::Single(statement)));
        r
    }

    pub fn push_statement(&mut self, statement: Arc<Statement>) {
        self.statement_stack
            .push(ExecutionContext::new(StatementPointer::Single(statement)));
    }
}
