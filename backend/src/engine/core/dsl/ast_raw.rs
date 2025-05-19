use serde::{Deserialize, Serialize};
pub type VarID = String;
pub type TypeID = String;

pub type Immediate = Literal;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Place {
    pub location: Vec<VarID>,
}

pub type GenericList = Option<Vec<String>>;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum TypeIdentifier {
    Regular(Place),
    Array(Place),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ObjectProperty {
    pub object_type: TypeIdentifier,
    pub name: VarID,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ObjectDecl {
    pub name: VarID,
    pub generics: GenericList,
    pub contents: ObjectDeclContents,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ObjectDeclContents {
    pub properties: Vec<ObjectProperty>,
    pub methods: Vec<FuncDecl>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Literal {
    Number(String),
    StringLiteral(String),
    BooleanLiteral(String),
    PlayerLiteral(String),
    ZoneLiteral(String),
    SuitLiteral(String),
    RankLiteral(String),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Expression {
    BinOp(BinOp),
    Imm(Immediate),
    Var(Place),
    FuncCall(FuncCall),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BinOp {
    pub a: Box<Expression>,
    pub b: Box<Expression>,
    pub op: BinOps,
}

pub fn new_binop(a: Expression, op: BinOps, b: Expression) -> Expression {
    let body = BinOp {
        a: Box::new(a),
        b: Box::new(b),
        op,
    };
    Expression::BinOp(body)
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum BinOps {
    GreaterThan,
    GreaterEqual,
    LesserThan,
    LesserEqual,
    Equal,
    Add,
    Subtract,
    Multiply, //Surely nobody would need to divide numbers to describe a card game
}

// let name : type = expression
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VarDecl {
    pub var_type: Option<TypeIdentifier>, // Infer types later on
    pub var_name: VarID,
    pub value: Option<Expression>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FuncParam {
    pub var_type: TypeIdentifier,
    pub var_name: VarID,
    pub value: Option<Expression>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FuncDecl {
    pub name: VarID,
    pub generics: GenericList,
    pub arguments: Vec<FuncParam>,
    pub body: Block,
    pub return_type: Option<TypeID>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FuncCall {
    pub name: VarID,
    pub arguments: Vec<FuncArg>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FuncArg {
    pub param_name: Option<VarID>,
    pub value: Expression,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Statement {
    Block(Block),
    Decl(VarDecl),
    Assign(Assign),
    Conditional(Conditional),
    FuncDecl(FuncDecl),
    ObjectDecl(ObjectDecl),
    Return,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Conditional {
    pub condition: Expression,
    pub exec_if: Block,
    pub exec_else: Option<Block>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Assign {
    pub from: Expression,
    pub to: Place,
}

//TODO: Unlikely to need block types
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Block {
    pub instructions: Vec<Statement>,
}

#[cfg(test)]
pub mod tests {
    use crate::ast_raw::{
        BooleanLiteralParser, ConditionalParser, ExpressionParser, LiteralParser,
        NumberLiteralParser, PlaceParser, RankLiteralParser, StatementListParser,
        SuitLiteralParser,
    };

    macro_rules! assert_parse_result {
        ($input:expr, $parser:expr, $ok:expr, $error_msg:expr) => {
            let parse_input = $input;
            let parse_result = $parser.parse(parse_input);
            let expected_ok = $ok;
            let msg = $error_msg;

            if expected_ok {
                assert!(
                    parse_result.is_ok(),
                    "Expected parse success for '{}' but got {:?}. Message: {}",
                    parse_input,
                    parse_result.unwrap_err(),
                    msg
                );
            } else {
                assert!(
                    parse_result.is_err(),
                    "Expected parse failure for '{}' but got {:?}. Message: {}",
                    parse_input,
                    parse_result.unwrap(),
                    msg
                );
            }
        };
    }

    #[test]
    pub fn rank_literal() {
        let parser = RankLiteralParser::new();
        assert_parse_result!("King", parser, true, "Failed to parse King");
        assert_parse_result!("Ace", parser, true, "Failed to parse Ace");
        assert_parse_result!("Seven", parser, true, "Failed to parse Seven");
        assert_parse_result!("NotARank", parser, false, "Incorrectly parsed invalid rank");
    }

    #[test]
    pub fn suit_literal() {
        let parser = SuitLiteralParser::new();
        assert_parse_result!("Hearts", parser, true, "Failed to parse Hearts");
        assert_parse_result!("Diamonds", parser, true, "Failed to parse Diamonds");
        assert_parse_result!("Clubs", parser, true, "Failed to parse Clubs");
        assert_parse_result!("Spades", parser, true, "Failed to parse Spades");
        assert_parse_result!("NotASuit", parser, false, "Incorrectly parsed invalid suit");
    }

    #[test]
    pub fn number_literal() {
        let parser = NumberLiteralParser::new();
        assert_parse_result!("-324", parser, true, "Failed to parse valid number -324");
        assert_parse_result!("0", parser, true, "Failed to parse valid number 0");
        assert_parse_result!(
            "51x191",
            parser,
            false,
            "Incorrectly parsed invalid number 51x191"
        );
        assert_parse_result!(
            "1.5",
            parser,
            false,
            "Incorrectly parsed float 1.5 as integer"
        );
    }

    #[test]
    pub fn bool_literal() {
        let parser = BooleanLiteralParser::new();
        assert_parse_result!("true", parser, true, "Failed to parse true");
        assert_parse_result!("false", parser, true, "Failed to parse false");
        assert_parse_result!(
            "True",
            parser,
            false,
            "Incorrectly parsed capitalized boolean"
        );
    }

    #[test]
    pub fn zone_literal() {
        let parser = LiteralParser::new(); // Use LiteralParser as ZoneLiteral is part of it
        assert_parse_result!("#deck#", parser, true, "Failed to parse #deck#");
        assert_parse_result!(
            "#discardPile#",
            parser,
            true,
            "Failed to parse #discardPile#"
        );
        assert_parse_result!(
            "notazone",
            parser,
            false,
            "Incorrectly parsed non-zone literal"
        );
        assert_parse_result!(
            "#invalid zone",
            parser,
            false,
            "Incorrectly parsed malformed zone"
        );
    }

    #[test]
    pub fn player_literal() {
        let parser = LiteralParser::new(); // Use LiteralParser as PlayerLiteral is part of it
        assert_parse_result!("`player1`", parser, true, "Failed to parse `player1`");
        assert_parse_result!("`dealer`", parser, true, "Failed to parse `dealer`");
        assert_parse_result!(
            "notaplayer",
            parser,
            false,
            "Incorrectly parsed non-player literal"
        );
        assert_parse_result!(
            "`invalid player",
            parser,
            false,
            "Incorrectly parsed malformed player"
        );
    }

    #[test]
    pub fn place() {
        let parser = PlaceParser::new();
        assert_parse_result!("myVar", parser, true, "Failed to parse simple variable");
        assert_parse_result!(
            "object.property",
            parser,
            true,
            "Failed to parse dotted property access"
        );
        assert_parse_result!(
            "a.b.c.d",
            parser,
            true,
            "Failed to parse multi-level dotted access"
        );
        // These next tests will fail until array indexing is implemented
        assert_parse_result!(
            "myArr[0]",
            parser,
            false,
            "Incorrectly parsed array indexing"
        );
        assert_parse_result!(
            "obj.list[idx]",
            parser,
            false,
            "Incorrectly parsed dotted access with indexing"
        );
    }

    #[test]
    pub fn expression() {
        let parser = ExpressionParser::new();
        assert_parse_result!(
            "variable",
            parser,
            true,
            "Failed to parse variable expression"
        );
        assert_parse_result!("Hearts", parser, true, "Failed to parse literal expression");
        assert_parse_result!(
            "variable + other > Card",
            parser,
            true,
            "Failed to parse complex expression"
        );
        assert_parse_result!(
            "1 + 2 * 3",
            parser,
            true,
            "Failed to parse arithmetic expression"
        );
        assert_parse_result!(
            "(1 + 2) * 3",
            parser,
            true,
            "Failed to parse parenthesized expression"
        );
        assert_parse_result!(
            "invalid + expression = ",
            parser,
            false,
            "Incorrectly parsed invalid expression"
        );
    }

    #[test]
    pub fn statement_list() {
        let parser = StatementListParser::new();
        //assert_parse_result!("", parser, /* allow empty list? */, "...");
        assert_parse_result!(
            "myVar = 10;",
            parser,
            true,
            "Failed to parse single assignment statement list"
        );
        assert_parse_result!(
            "let x : N = 1; y = 2; if z > 0 { z = z - 1; };",
            parser,
            true,
            "Failed to parse multiple statement list"
        );
        assert_parse_result!(
            "let a : N; { a = 1; }; a = 2; if a == 2 {};",
            parser,
            true,
            "Failed to parse mixed statement list"
        );

        assert_parse_result!(
            "myVar = 10; otherVar = 20",
            parser,
            false,
            "Incorrectly parsed list with missing semicolon"
        );
        assert_parse_result!(
            "myVar = 10 extra; otherVar = 20;",
            parser,
            false,
            "Incorrectly parsed list with invalid statement"
        );
    }

    #[test]
    pub fn conditional() {
        let parser = ConditionalParser::new();

        // Valid conditional statements
        let input1 = "if x > 5 { y = 10; };";
        let input2 = "if done { return; } else { progress = progress + 1; };";
        let input3 = "if is_valid {} else { error = true; };"; // Empty if block
        let input4 = "if flag { { nested = true; }; };"; // Nested block

        // Invalid conditional statements
        let input5 = "if x > 5 y = 10; };"; // Missing braces for block
        let input6 = "if x > 5 { y = 10; } else ;"; // Else block missing
        let input7 = "if { y = 10; };"; // Missing condition
        let input8 = "if x > 5 { y = 10; } else other = 5;"; // Missing braces for else block
        let input9 = "if x > 5 { y = 10; } else { z = 20; }"; // Missing trailing semicolon

        assert_parse_result!(input1, parser, true, "Failed to parse valid conditional");
        assert_parse_result!(
            input2,
            parser,
            true,
            "Failed to parse valid conditional with else"
        );
        assert_parse_result!(
            input3,
            parser,
            true,
            "Failed to parse valid conditional with empty if block"
        );
        assert_parse_result!(
            input4,
            parser,
            true,
            "Failed to parse valid conditional with nested block"
        );

        assert_parse_result!(
            input5,
            parser,
            false,
            "Incorrectly parsed invalid conditional (missing block braces)"
        );
        assert_parse_result!(
            input6,
            parser,
            false,
            "Incorrectly parsed invalid conditional (else block missing)"
        );
        assert_parse_result!(
            input7,
            parser,
            false,
            "Incorrectly parsed invalid conditional (missing condition)"
        );
        assert_parse_result!(
            input8,
            parser,
            false,
            "Incorrectly parsed invalid conditional (else block missing braces)"
        );
        assert_parse_result!(
            input9,
            parser,
            false,
            "Incorrectly parsed invalid conditional (missing trailing semicolon)"
        );
    }
    #[test]
    pub fn func_decl() {
        use crate::ast_raw::FuncDeclParser;
        let parser = FuncDeclParser::new();

        // Valid function declarations (including generics)
        let input1 = "fn myFunc(param1 : Type1) -> ReturnType { let a = 24; return; };";
        let input2 = "fn anotherFunc() -> bool { return; };"; // No parameters
        let input3 = "fn thirdFunc(a : N, b : S) { a = b; };"; // Multiple parameters, no return type
        let input4 = "fn emptyFunc() {};"; // Empty body
        let input5 = "fn complexFunc(p1 : T1 = 1, p2 : T2 = false) -> T3 { if p1 > 0 { p2 = true; }; return; };"; // Params with default values, conditional in body
        let input6 = "fn genericFunc<T>(arg : T) {};"; // Function with one generic
        let input7 = "fn multiGenericFunc<K, V>(key : K, value : V) -> bool { return; };"; // Function with multiple generics
        let input8 = "fn funcWithGenericParamAndReturn<A, B>(a : A) -> B {};"; // Function with generic param and return

        // Invalid function declarations
        let input9 = "fn invalidFunc param1 : Type1) -> ReturnType { let a = 24; };"; // Missing opening parenthesis
        let input10 = "fn invalidFunc(param1 : Type1 -> ReturnType { let a = 24; };"; // Missing closing parenthesis
        let input11 = "fn invalidFunc(param1) -> ReturnType { let a = 24; };"; // Missing parameter type
        let input12 = "fn invalidFunc(param1 : Type1) -> { let a = 24; };"; // Missing return type name
        let input13 = "fn invalidFunc(param1 : Type1) -> ReturnType let a = 24; };"; // Missing body braces
        let input14 = "fn invalidFunc(param1 : Type1) -> ReturnType { let a = 24; }"; // Missing trailing semicolon
        let input15 = "invalidFunc(param1 : Type1) -> ReturnType { let a = 24; };"; // Missing 'fn' keyword
        let input16 = "fn invalidGenericFunc<T {};"; // Missing '>' in generic list
        let input17 = "fn invalidGenericFunc<> {};"; // Empty generic list (usually disallowed by compilers, grammar might allow)
        let input18 = "fn invalidGenericFunc<T,> {};"; // Trailing comma in generic list

        assert_parse_result!(input1, parser, true, "Failed to parse valid func decl 1");
        assert_parse_result!(
            input2,
            parser,
            true,
            "Failed to parse valid func decl 2 (no params)"
        );
        assert_parse_result!(
            input3,
            parser,
            true,
            "Failed to parse valid func decl 3 (multiple params, no return)"
        );
        assert_parse_result!(
            input4,
            parser,
            true,
            "Failed to parse valid func decl 4 (empty body)"
        );
        assert_parse_result!(
            input5,
            parser,
            true,
            "Failed to parse valid func decl 5 (params with defaults)"
        );
        assert_parse_result!(
            input6,
            parser,
            true,
            "Failed to parse valid func decl 6 (one generic)"
        );
        assert_parse_result!(
            input7,
            parser,
            true,
            "Failed to parse valid func decl 7 (multiple generics)"
        );
        assert_parse_result!(
            input8,
            parser,
            true,
            "Failed to parse valid func decl 8 (generic param and return)"
        );

        assert_parse_result!(
            input9,
            parser,
            false,
            "Incorrectly parsed invalid func decl 9 (missing '(')"
        );
        assert_parse_result!(
            input10,
            parser,
            false,
            "Incorrectly parsed invalid func decl 10 (missing ')'"
        );
        assert_parse_result!(
            input11,
            parser,
            false,
            "Incorrectly parsed invalid func decl 11 (missing param type)"
        );
        assert_parse_result!(
            input12,
            parser,
            false,
            "Incorrectly parsed invalid func decl 12 (missing return type name)"
        );
        assert_parse_result!(
            input13,
            parser,
            false,
            "Incorrectly parsed invalid func decl 13 (missing body braces)"
        );
        assert_parse_result!(
            input14,
            parser,
            false,
            "Incorrectly parsed invalid func decl 14 (missing trailing ';')"
        );
        assert_parse_result!(
            input15,
            parser,
            false,
            "Incorrectly parsed invalid func decl 15 (missing 'fn')"
        );
        assert_parse_result!(
            input16,
            parser,
            false,
            "Incorrectly parsed invalid func decl 16 (missing '>')"
        );
        assert_parse_result!(
            input17,
            parser,
            false,
            "Incorrectly parsed invalid func decl 17 (empty generics <>)"
        );
        assert_parse_result!(
            input18,
            parser,
            false, // Grammar should prevent trailing comma
            "Incorrectly parsed invalid func decl 18 (trailing comma in generics)"
        );
    }
}
