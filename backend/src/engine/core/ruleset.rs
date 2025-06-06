use crate::engine::core::cards;
use crate::engine::core::dsl::ast_typed::*;

use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::ops::Range;

// Data oriented serializable structure that can be
//

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Ruleset {
    pub player_range: Range<u32>,
    pub starting_cards: CardSet,
    pub zone_templates: HashMap<ZoneId, ZoneTemplate>, // zones
}

mod example {
    use super::*;

    fn go_fish() {
        let suits: HashSet<cards::Suit> = HashSet::from_iter(cards::Suit::all());
        let ranks: HashSet<cards::Rank> = HashSet::from_iter(cards::Rank::all());
        let starters = CardSet { suits, ranks };
        let player_range: Range<u32> = 2..5;

        let public_deck: ZoneTemplate = ZoneTemplate {
            id: String::from("go_fish:template_public_deck"),
            name: String::from("public_deck"),
            owner: Owner::Game,
            capacity: Some(52),
            tags: HashSet::new(),
        };

        let player_deck: ZoneTemplate = ZoneTemplate {
            id: String::from("go_fish:template_player_deck"),
            name: String::from("player_deck"),
            owner: Owner::Player,
            capacity: None,
            tags: HashSet::new(),
        };

        let mut var_mappings: HashMap<String, ZoneId> = HashMap::new();
        var_mappings.insert(player_deck.name.clone(), player_deck.id.clone());

        let player_def = PlayerTemplate {
            zones: var_mappings,
        };
    }
}
