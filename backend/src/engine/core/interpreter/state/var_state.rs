use super::game_state;
use std::collections::HashMap;
pub struct VarMapping {
    pub zone: HashMap<String, game_state::GameZoneID>,
    pub zone_collection: HashMap<String, Vec<game_state::GameZoneID>>,
    pub player: HashMap<String, game_state::PlayerOrderIndex>,
    pub player_collection: HashMap<String, game_state::PlayerOrderIndex>,
    pub card: HashMap<String, game_state::CardID>,
    pub card_collection: HashMap<String, Vec<game_state::CardID>>,

    pub number: HashMap<String, i32>,
}

impl VarMapping {
    pub fn new() -> Self {
        Self {
            zone: HashMap::new(),
            zone_collection: HashMap::new(),
            player: HashMap::new(),
            player_collection: HashMap::new(),
            card: HashMap::new(),
            card_collection: HashMap::new(),

            number: HashMap::new(),
        }
    }
}
