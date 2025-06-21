use crate::engine::core::types;
pub type BaseNumberType = i32;

pub enum TypeInstance {
    Number(BaseNumberType),
    Boolean(bool),

    Zone(types::identifiers::VariableIdentifier),
    ZoneCollection(Vec<types::identifiers::VariableIdentifier>),
    Player(types::identifiers::VariableIdentifier),
    PlayerCollection(Vec<types::identifiers::VariableIdentifier>),
}
