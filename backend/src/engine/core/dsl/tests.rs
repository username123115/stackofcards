#[cfg(test)]
use crate::grammar::VariableDeclParser;

#[test]
pub fn declare_variables() {
    assert!(
        VariableDeclParser::new()
            .parse("let myNumber : Number = 5;")
            .is_ok()
    );
    assert!(
        VariableDeclParser::new()
            .parse("let mySuit : Suit = Hearts;")
            .is_ok()
    );

    assert!(
        VariableDeclParser::new()
            .parse("let myRank : Rank = Ace;")
            .is_ok()
    );

    assert!(
        VariableDeclParser::new()
            .parse("let deck : Zone = #deck#;")
            .is_ok()
    );

    assert!(
        VariableDeclParser::new()
            .parse("let p0 : Player = `soc_player_0`;")
            .is_ok()
    );
    assert!(VariableDeclParser::new().parse("let x : Number;").is_ok());
    assert!(VariableDeclParser::new().parse("let x : Suit;").is_ok());
    assert!(VariableDeclParser::new().parse("let x : Rank;").is_ok());
    assert!(VariableDeclParser::new().parse("let x : Zone;").is_ok());
    assert!(VariableDeclParser::new().parse("let x : Player;").is_ok());
}
