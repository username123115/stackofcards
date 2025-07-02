use crate::engine::core::interpreter::lang::statements;
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
    pub root_phase: Arc<Statement>,
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
}

impl ExecutionContext {
    pub fn new(location: StatementPointer) -> Self {
        Self { location }
    }
}

#[derive(Error, Debug, Clone)]
pub enum ExecutionContextError {
    #[error("Execution has finished")]
    OutOfStatements,
    #[error("Statement was of wrong type")]
    IncorrectVariant,
    #[error("Statement did not refer to a block")]
    WrongStatementPointer,
}

impl ExecutionState {
    pub fn new(root_phase: Arc<Statement>) -> Self {
        let mut r = Self {
            statements_evaluated: 0,
            statement_limit: 1000,
            statement_stack: Vec::new(),
            root_phase,
        };
        r.push_statement(r.root_phase.clone());
        r
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

    pub fn upgrade_statement(&mut self) -> Result<(), ExecutionContextError> {
        let target = self.get_current_statement();
        match target {
            None => Err(ExecutionContextError::OutOfStatements),
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
                _ => Err(ExecutionContextError::IncorrectVariant),
            },
        }
    }

    pub fn incr_current(&mut self, incr: u32) -> Result<(), ExecutionContextError> {
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
                            return Err(ExecutionContextError::WrongStatementPointer);
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
    ) -> Result<(), ExecutionContextError> {
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
