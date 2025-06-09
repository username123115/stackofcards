use super::expressions;
pub enum Statement {
    Empty,
    Block(Vec<Statement>),
    Conditional(ConditionalStatement),
}

pub struct ConditionalStatement {
    pub condition: expressions::BooleanExpression,
    pub go_true: Box<Statement>,
    pub go_false: Box<Statement>,
}
