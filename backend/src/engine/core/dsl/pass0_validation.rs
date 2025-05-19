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

pub struct Declarations {}
