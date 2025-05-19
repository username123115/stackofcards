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
* Place resolution:
*   Do variables point to
*/

pub struct Declarations {}
