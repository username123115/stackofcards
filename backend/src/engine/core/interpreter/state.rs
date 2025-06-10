use super::{
    config,
    lang::{expressions, phases, statements, types_instances},
};

use std::rc::Rc;

use crate::engine::core::types::{cards, identifiers::*, patterns, players, zones};

use std::collections::{HashMap, HashSet};

pub type GameZoneID = u64;
pub type PlayerOrderIndex = u64;

pub struct GameActivePlayer {}

pub struct GameActiveZone {
    pub zone_id: GameZoneID,
    pub cards: Vec<u64>,
    pub class: ZoneClassIdentifier,
    pub owner: Option<PlayerOrderIndex>,
    pub owner_name: Option<VariableIdentifier>,
    pub name: Option<VariableIdentifier>,
}

impl GameActiveZone {
    pub fn new(
        zone_id: GameZoneID,
        cards: Vec<u64>,
        class: ZoneClassIdentifier,
        owner: Option<PlayerOrderIndex>,
        owner_name: Option<VariableIdentifier>,
        name: Option<VariableIdentifier>,
    ) -> Self {
        Self {
            zone_id,
            cards,
            class,
            owner,
            owner_name,
            name,
        }
    }
}

pub struct GameZoneState {
    pub config: Rc<config::GameConfig>,
    pub zones: HashMap<GameZoneID, GameActiveZone>,
    zones_created: GameZoneID,
}

impl GameZoneState {
    pub fn new(config: Rc<config::GameConfig>) -> Self {
        Self {
            config,
            zones: HashMap::new(),
            zones_created: 0,
        }
    }

    pub fn next_id(&mut self) -> GameZoneID {
        self.zones_created += 1;
        self.zones_created
    }

    pub fn create_zone(
        &mut self,
        cards: Vec<u64>,
        class: &ZoneClassIdentifier,
    ) -> Result<GameZoneID, String> {
        if let Some(_) = self.config.zone_classes.get(class) {
            let zone_id = self.next_id();
            let z = GameActiveZone::new(zone_id, cards, class.clone(), None, None, None);
            self.zones.insert(zone_id, z);
            return Ok(zone_id);
        } else {
            return Err("Zone creator used nonexistant class".into());
        }
    }
}
