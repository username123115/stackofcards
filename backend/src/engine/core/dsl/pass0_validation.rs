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

use crate::engine::core::cards;
use crate::engine::core::dsl::ast_raw as raw;

use std::cmp::{Eq, PartialEq};
use std::collections::{HashMap, HashSet};

impl raw::Literal {
    fn to_type(&self) -> BaseType {
        use raw::Literal;
        match self {
            Literal::Number(_) => BaseType::Number(None),
            Literal::StringLiteral(_) => BaseType::String(None),
            Literal::BooleanLiteral(_) => BaseType::Boolean(None),
            Literal::PlayerLiteral(_) => BaseType::PlayerRef(None),
            Literal::ZoneLiteral(_) => BaseType::ZoneRef(None),
            Literal::SuitLiteral(_) => BaseType::Suit(None),
            Literal::RankLiteral(_) => BaseType::Rank(None),
        }
    }
    fn to_type_value(&self) -> Result<BaseType, String> {
        use raw::Literal;
        match self {
            Literal::Number(s) => s
                .parse::<u32>()
                .map(|val| BaseType::Number(Some(val)))
                .map_err(|e| format!("Failed to parse number literal '{}': {}", s, e)),
            Literal::StringLiteral(s) => Ok(BaseType::String(Some(s.clone()))),
            Literal::BooleanLiteral(s) => s
                .parse::<bool>()
                .map(|val| BaseType::Boolean(Some(val)))
                .map_err(|e| format!("Failed to parse boolean literal '{}': {}", s, e)),

            // Parser should have already stripped surrounding characters, these can be treated as
            // special String literals basically
            Literal::PlayerLiteral(s) => Ok(BaseType::PlayerRef(Some(s.clone()))),
            Literal::ZoneLiteral(s) => Ok(BaseType::ZoneRef(Some(s.clone()))),
            Literal::SuitLiteral(s) => match s.as_str() {
                "Hearts" => Ok(BaseType::Suit(Some(cards::Suit::Hearts))),
                "Diamonds" => Ok(BaseType::Suit(Some(cards::Suit::Diamonds))),
                "Spades" => Ok(BaseType::Suit(Some(cards::Suit::Spades))),
                "Clubs" => Ok(BaseType::Suit(Some(cards::Suit::Clubs))),
                _ => Err(format!("Unknown suit literal: {}", s)),
            },
            Literal::RankLiteral(s) => match s.as_str() {
                "Two" => Ok(BaseType::Rank(Some(cards::Rank::Two))),
                "Three" => Ok(BaseType::Rank(Some(cards::Rank::Three))),
                "Four" => Ok(BaseType::Rank(Some(cards::Rank::Four))),
                "Five" => Ok(BaseType::Rank(Some(cards::Rank::Five))),
                "Six" => Ok(BaseType::Rank(Some(cards::Rank::Six))),
                "Seven" => Ok(BaseType::Rank(Some(cards::Rank::Seven))),
                "Eight" => Ok(BaseType::Rank(Some(cards::Rank::Eight))),
                "Nine" => Ok(BaseType::Rank(Some(cards::Rank::Nine))),
                "Ten" => Ok(BaseType::Rank(Some(cards::Rank::Ten))),
                "Jack" => Ok(BaseType::Rank(Some(cards::Rank::Jack))),
                "Queen" => Ok(BaseType::Rank(Some(cards::Rank::Queen))),
                "King" => Ok(BaseType::Rank(Some(cards::Rank::King))),
                "Ace" => Ok(BaseType::Rank(Some(cards::Rank::Ace))),
                _ => Err(format!("Unknown rank literal: {}", s)),
            },
        }
    }
}

#[derive(Debug, PartialEq, Eq)]
enum BaseType {
    ZoneRef(Option<String>),
    PlayerRef(Option<String>),
    Number(Option<u32>),
    String(Option<String>),
    Rank(Option<cards::Rank>),
    Suit(Option<cards::Suit>),
    Boolean(Option<bool>),
}

#[derive(Debug)]
enum AnyType {
    Base(BaseType),

    // Doesn't have default value, should transformed into some other type first
    Generic(SymbolIdentifier),

    // TODO: Give these default values
    FunctionSignature,
    Object(SymbolIdentifier),
    Array(Box<AnyType>),
}

#[derive(Debug)]
struct ObjectInstance {
    created_from: SymbolIdentifier,
}

#[derive(Debug, PartialEq, Eq, Hash)]
enum SymbolIdentifier {
    Named(String),
    Anonymous(u64),
}

struct Variable {
    variable_type: AnyType,
    //TODO: Initialize variables
}

struct ObjectDeclaration {
    variables: HashMap<String, Variable>,
    generics: HashSet<String>,
}

// top level declarations in a block

struct SymbolSpace {
    objects: HashMap<String, ObjectDeclaration>,
    variables: HashMap<String, Variable>,
    generics: HashSet<String>,
}

impl SymbolSpace {
    fn new() -> Self {
        Self {
            objects: HashMap::new(),
            variables: HashMap::new(),
            generics: HashSet::new(),
        }
    }

    // TODO: Errors for duplicated variables in same symbol space
    fn add_variable(&mut self, name: String, variable: Variable) {
        self.variables.insert(name, variable);
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

impl SymbolTree {
    // add a child to tree, turning it from a Leaf to a Node if it wasn't already
    // TODO: Return an error if child already exists
    fn add_child(&mut self, identifier: SymbolIdentifier, tree: SymbolTree) {
        match &mut self.children {
            Some(children) => {
                children.insert(identifier, tree);
            }
            None => {
                let mut new_child = HashMap::new();
                new_child.insert(identifier, tree);
                self.children = Some(new_child);
            }
        }
    }
}

fn resolve_block(
    block: &raw::Block,
    global_tree: Option<&SymbolTree>,
) -> Result<SymbolTree, String> {
    let mut tree = SymbolTree::new();

    let mut pending_blocks: Vec<&raw::Block> = Vec::new();

    for statement in &block.instructions {
        use raw::Statement;
        match statement {
            Statement::Block(blk) => pending_blocks.push(&blk),
            Statement::Decl(dcl) => (),

            _ => return Err(String::from("🙁")),
        }
    }

    // Take care of blocks last
    let mut block_count = 0;
    for pending in &pending_blocks {
        // TODO: Handle special blocks wrt nesting rules + non numeric identities
        let identity = SymbolIdentifier::Anonymous(block_count);
        let context = match global_tree {
            Option::Some(tree_ref) => tree_ref,
            Option::None => &tree,
        };

        let child: SymbolTree = resolve_block(pending, Option::Some(context))?;
        tree.add_child(identity, child);

        block_count += 1;
    }

    Ok(tree)
}

fn resolve_expression(expression: &raw::Expression) -> Result<AnyType, String> {
    use raw::Expression;
    match expression {
        Expression::Imm(imm) => Result::Ok(AnyType::Base(imm.to_type())),
        _ => Result::Err(String::from("unimplemented")),
    }
}

#[cfg(test)]
pub mod tests {
    use super::*;
    use crate::engine::core::dsl::ast_raw as raw;

    #[test]
    fn test_literal_to_type() {
        assert_eq!(
            raw::Literal::Number("123".to_string()).to_type(),
            BaseType::Number(None)
        );
        assert_eq!(
            raw::Literal::StringLiteral("hello".to_string()).to_type(),
            BaseType::String(None)
        );
        assert_eq!(
            raw::Literal::BooleanLiteral("true".to_string()).to_type(),
            BaseType::Boolean(None)
        );
        // Note: Raw AST player/zone literals now contain the inner string, not the delimiters
        assert_eq!(
            raw::Literal::PlayerLiteral("player1".to_string()).to_type(),
            BaseType::PlayerRef(None)
        );
        assert_eq!(
            raw::Literal::ZoneLiteral("deck".to_string()).to_type(),
            BaseType::ZoneRef(None)
        );
        assert_eq!(
            raw::Literal::SuitLiteral("Hearts".to_string()).to_type(),
            BaseType::Suit(None)
        );
        assert_eq!(
            raw::Literal::RankLiteral("Ace".to_string()).to_type(),
            BaseType::Rank(None)
        );
    }

    #[test]
    fn test_literal_to_type_value() {
        // Test valid values
        assert_eq!(
            raw::Literal::Number("123".to_string())
                .to_type_value()
                .unwrap(),
            BaseType::Number(Some(123))
        );
        assert_eq!(
            raw::Literal::StringLiteral("hello".to_string())
                .to_type_value()
                .unwrap(),
            BaseType::String(Some("hello".to_string()))
        );
        assert_eq!(
            raw::Literal::BooleanLiteral("true".to_string())
                .to_type_value()
                .unwrap(),
            BaseType::Boolean(Some(true))
        );
        assert_eq!(
            raw::Literal::BooleanLiteral("false".to_string())
                .to_type_value()
                .unwrap(),
            BaseType::Boolean(Some(false))
        );
        // Player literal string is the inner value from the parser
        assert_eq!(
            raw::Literal::PlayerLiteral("player1".to_string())
                .to_type_value()
                .unwrap(),
            BaseType::PlayerRef(Some("player1".to_string()))
        );
        // Zone literal string is the inner value from the parser
        assert_eq!(
            raw::Literal::ZoneLiteral("deck".to_string())
                .to_type_value()
                .unwrap(),
            BaseType::ZoneRef(Some("deck".to_string()))
        );
        assert_eq!(
            raw::Literal::SuitLiteral("Hearts".to_string())
                .to_type_value()
                .unwrap(),
            BaseType::Suit(Some(cards::Suit::Hearts))
        );
        assert_eq!(
            raw::Literal::RankLiteral("Ace".to_string())
                .to_type_value()
                .unwrap(),
            BaseType::Rank(Some(cards::Rank::Ace))
        );

        // Test invalid values (parsing errors, not format errors handled here)
        assert!(
            raw::Literal::Number("abc".to_string())
                .to_type_value()
                .is_err()
        );
        assert!(
            raw::Literal::BooleanLiteral("True".to_string())
                .to_type_value()
                .is_err()
        ); // Capitalized
        assert!(
            raw::Literal::BooleanLiteral("falsey".to_string())
                .to_type_value()
                .is_err()
        );
        // Player/Zone literals with invalid *content* (if applicable to game logic) would be checked here,
        // but malformed syntax (`player1`, `#deck`, etc.) should be caught by the parser.
        assert!(
            raw::Literal::SuitLiteral("Clubs!".to_string())
                .to_type_value()
                .is_err()
        ); // Invalid suit name
        assert!(
            raw::Literal::RankLiteral("Joker".to_string())
                .to_type_value()
                .is_err()
        ); // Invalid rank name
    }
}
