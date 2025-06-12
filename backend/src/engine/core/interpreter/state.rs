use super::{
    config,
    lang::{expressions, phases, statements, types_instances},
};
use crate::engine::core::types::*;
use identifiers::*;

use std::cmp::min;
use std::collections::{HashMap, HashSet};
use std::sync::Arc;

pub type GameZoneID = u64;
pub type PlayerOrderIndex = u64;

use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Clone)]
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

#[derive(TS, Debug, Clone, Deserialize, Serialize)]
#[ts(export)]
pub enum GameStatus {
    Waiting(GameWaitingStatus),
    Playing,
    Invalid,
}

#[derive(TS, Debug, Clone, Deserialize, Serialize)]
#[ts(export)]
pub enum GameWaitingStatus {
    NotReady,
    Ready,
}

#[derive(Debug, Clone)]
pub struct GameState {
    pub config: Arc<config::GameConfig>,
    pub zones: HashMap<GameZoneID, GameActiveZone>,
    pub cards: HashMap<u64, cards::Card>,
    pub players: Vec<PlayerClassIdentifier>,
    pub status: GameStatus,
    zones_created: GameZoneID,
    cards_created: u64,
}

#[derive(Debug, Clone)]
pub enum StateRuntimeError {
    ClassInit(RuntimeClassInitError),
}

#[derive(Debug, Clone)]
pub enum RuntimeClassInitError {
    Zone(ZoneClassIdentifier),
    Player(PlayerClassIdentifier),
}

//State method didn't execute correctly
#[derive(Debug, Clone)]
pub enum StateMethodError {
    WrongStatus,                      //Recoverable, just wait for status to change
    InternalError(StateRuntimeError), //Fatal
}

impl GameState {
    pub fn new(config: Arc<config::GameConfig>) -> Self {
        Self {
            config,
            zones: HashMap::new(),
            cards: HashMap::new(),
            players: Vec::new(),
            status: GameStatus::Waiting(GameWaitingStatus::NotReady),
            zones_created: 0,
            cards_created: 0,
        }
    }

    //TODO
    pub fn check_config(&self) -> Result<(), String> {
        Ok(())
    }

    pub fn new_card(&mut self, card: cards::Card) -> u64 {
        let card_id = self.next_card_id();
        self.cards.insert(card_id, card);
        card_id
    }

    pub fn new_cardset(&mut self, set: &cards::CardSet) -> Vec<u64> {
        let mut result = Vec::with_capacity(set.ranks.len() * set.suits.len());
        for suit in set.suits.iter() {
            for rank in set.ranks.iter() {
                result.push(self.new_card(cards::Card {
                    suit: *suit,
                    rank: *rank,
                }));
            }
        }
        result
    }

    // Assign players roles depending on class order
    pub fn create_players(&mut self, player_count: u64) -> Result<(), String> {
        if let GameStatus::Waiting(_) = self.status {
            let to_create = min(player_count, self.config.player_range.end);
            let mut players: Vec<PlayerClassIdentifier> = Vec::with_capacity(to_create as usize);
            for i in 0..to_create {
                let mut player_assignment: Option<String> = None;

                for class_name in &self.config.player_assignment {
                    let class_opt = &self.config.player_classes.get(class_name);
                    let mut found: bool = false;
                    match class_opt {
                        Some(class) => match class.assignment_rule {
                            players::PlayerAssignmentRule::All => found = true,
                            players::PlayerAssignmentRule::Index(idx) => {
                                let cur_idx = i as i64;
                                let length = to_create as i64;
                                if cur_idx == idx {
                                    found = true;
                                } else if (idx < 0) && (cur_idx == (length + idx)) {
                                    found = true;
                                }
                            }
                        },
                        None => {
                            tracing::error!(
                                "Couldn't find class {class_name} while assigning a player"
                            );
                            self.status = GameStatus::Waiting(GameWaitingStatus::NotReady);
                            return Err("Class definition not found".into());
                        }
                    }
                    if found {
                        player_assignment = Some(class_name.clone());
                        break;
                    }
                }

                match player_assignment {
                    Some(cn) => players.push(cn),
                    None => {
                        self.status = GameStatus::Waiting(GameWaitingStatus::NotReady);
                        return Err("Couldn't assign to a player".into());
                    }
                }
            }
            if (player_count >= self.config.player_range.start)
                && (player_count <= self.config.player_range.end)
            {
                self.status = GameStatus::Waiting(GameWaitingStatus::Ready);
            } else {
                self.status = GameStatus::Waiting(GameWaitingStatus::NotReady);
            }
            self.players = players;
            return Ok(());
        }
        Err("Game already started".into())
    }

    pub fn game_ready(&self) -> bool {
        if let GameStatus::Waiting(GameWaitingStatus::Ready) = self.status {
            return true;
        }
        return false;
    }

    // Checks if game has enough players and starts
    pub fn init_game(&mut self) -> Result<(), StateMethodError> {
        if self.game_ready() {
            self.status = GameStatus::Playing;

            //Create initial zones
            for (name, class) in self.config.clone().initial_zones.iter() {
                match self.create_zone(Vec::new(), &class) {
                    Ok(zid) => {}
                    Err(s) => (),
                }
            }

            todo!("Implement me");

            Ok(())
        } else {
            return Err(StateMethodError::WrongStatus);
        }
    }

    pub fn next_zone_id(&mut self) -> GameZoneID {
        self.zones_created += 1;
        self.zones_created
    }

    pub fn next_card_id(&mut self) -> u64 {
        self.cards_created += 1;
        self.cards_created
    }

    pub fn create_zone(
        &mut self,
        cards: Vec<u64>,
        class: &ZoneClassIdentifier,
    ) -> Result<GameZoneID, String> {
        if let Some(_) = self.config.zone_classes.get(class) {
            let zone_id = self.next_zone_id();
            let z = GameActiveZone::new(zone_id, cards, class.clone(), None, None, None);
            self.zones.insert(zone_id, z);
            return Ok(zone_id);
        } else {
            return Err("Zone creator used nonexistant class".into());
        }
    }
}
