use super::statements;

#[derive(Debug, Clone)]
pub struct Phase {
    evaluate: statements::Statement,
}
