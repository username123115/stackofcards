use backend::engine::{cards, game, ruleset};

fn main() {
    let go_fish = ruleset::Ruleset { player_range: 1..4 };
    let new_game = game::Game::new(go_fish);

    println!("Hello, world!");
}
