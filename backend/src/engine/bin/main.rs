use backend::engine::{cards, game, ruleset};

fn main() {
    let go_fish = ruleset::Ruleset { player_range: 1..4 };
    let new_game = game::Game::new(go_fish);

    println!("Hello, world!");
}

/*
* General ideas
*
* Continuation: Support playing up until card exhaustion
*/

/*
* Engine ideas
*
* Conditions: Win, Tie, Draw, Abort
*
* Continuation - Exits: Can the game continue if a player leaves?
*
*/
