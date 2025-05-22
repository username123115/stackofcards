// This module takes a raw AST and applies the following transformations
/*
*
* Declaration resolution
*   Each block
*
* Object rules
*   Only declarable in top level or as direct descendants of module blocks
*
* Module rules
*   Only declarable in top level or as direct descendants of module blocks
*
* Type resolution:
*   Resolve Literals to their types (Card -> BuiltinTypes::Card)
*
*
* Place resolution:
*   Do variables point to
*
*
* Symbol table
* Tree built alongside source tree: Begin at root node: Modules are nodes, each node has it's
* position (e.g. ["card", "std", "node"]) than during access climb up these nodes)
*
* During evaluation this tree builds differently as different parts of the language are entered
*
*/

use crate::engine::core::dsl::ast_raw as raw;
use std::collections::{HashMap, HashSet};

impl raw::Literal {
    fn to_type(&self) -> BaseType {
        use raw::Literal;
        match self {
            Literal::Number(_) => BaseType::Number,
            Literal::StringLiteral(_) => BaseType::String,
            Literal::BooleanLiteral(_) => BaseType::Boolean,
            Literal::PlayerLiteral(_) => BaseType::PlayerRef,
            Literal::ZoneLiteral(_) => BaseType::ZoneRef,
            Literal::SuitLiteral(_) => BaseType::Suite,
            Literal::RankLiteral(_) => BaseType::Rank,
        }
    }
}

struct SymbolIndex {
    location: Vec<String>,
}

enum BaseType {
    ZoneRef,
    PlayerRef,
    Number,
    String,
    Rank,
    Suite,
    Boolean,
}

enum AnyType {
    Base(BaseType),
    Object(SymbolIndex),
    Generic(SymbolIndex),
    FunctionSignature,
    Array(Box<AnyType>),
}

enum SymbolIdentifier {
    Named(String),
    Anonymous(u64),
}

struct Variable {
    variable_type: AnyType,
    //TODO: Initialize variables
}

// top level declarations in a block
struct SymbolSpace {
    objects: HashMap<String, Object>,
    variables: HashMap<String, Variable>,
    generics: HashSet<String>,
}

struct Object {
    declarations: HashMap<String, AnyType>,
}

impl SymbolSpace {
    fn new() -> Self {
        Self {
            objects: HashMap::new(),
            variables: HashMap::new(),
            generics: HashSet::new(),
        }
    }
}

struct SymbolPath {
    path: Vec<SymbolIdentifier>,
}

struct SymbolTree {
    // Identifier can be nameless block in which case
    children: Option<HashMap<SymbolIdentifier, SymbolTree>>,
    value: SymbolSpace,
}

impl SymbolTree {
    fn new() -> Self {
        Self {
            children: None,
            value: SymbolSpace::new(),
        }
    }
}

fn resolve_expression(expression: &raw::Expression) -> Result<AnyType, String> {
    use raw::Expression;
    match expression {
        Expression::Imm(imm) => Result::Ok(AnyType::Base(imm.to_type())),
        _ => Result::Err(String::from("unimplemented")),
    }
}
