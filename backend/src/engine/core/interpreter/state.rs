use super::{
    config,
    lang::{expressions, phases, statements, types_instances},
};
use crate::engine::core::types::identifiers::*;
use crate::engine::core::types::*;

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
    pub owner: Option<GameZoneOwnership>,
    pub name: Option<VariableIdentifier>,
}

#[derive(Debug, Clone)]
pub struct GameZoneOwnership {
    player: PlayerOrderIndex,
    zone_name: Option<VariableIdentifier>,
}

impl GameActiveZone {
    pub fn new(
        zone_id: GameZoneID,
        cards: Vec<u64>,
        class: ZoneClassIdentifier,
        owner: Option<GameZoneOwnership>,
        name: Option<VariableIdentifier>,
    ) -> Self {
        Self {
            zone_id,
            cards,
            class,
            owner,
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
pub struct CardState {
    config: Arc<config::GameConfig>,
    zones: HashMap<GameZoneID, GameActiveZone>,
    cards: HashMap<u64, cards::Card>,
    zones_created: GameZoneID,
    cards_created: u64,
}

impl CardState {
    pub fn new(config: Arc<config::GameConfig>) -> Self {
        Self {
            config,
            zones: HashMap::new(),
            cards: HashMap::new(),
            zones_created: 0,
            cards_created: 0,
        }
    }
}

impl CardState {
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
        owner: Option<GameZoneOwnership>,
        name: Option<VariableIdentifier>,
    ) -> Result<GameZoneID, RuntimeError> {
        if let Some(_) = self.config.zone_classes.get(class) {
            /* if let Some(idx) = owner {
                if idx >= self.players.len() as u64 {
                    return Err(RuntimeError::MissingResource(MissingResourceError::Player(
                        idx,
                    )));
                }
            } */

            let zone_id = self.next_zone_id();
            let z = GameActiveZone::new(zone_id, cards, class.clone(), owner, name);
            self.zones.insert(zone_id, z);
            return Ok(zone_id);
        } else {
            return Err(RuntimeError::Init(InitError::Zone(class.clone())));
        }
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
}

#[derive(Debug, Clone)]
pub struct GameState {
    pub config: Arc<config::GameConfig>,
    pub status: GameStatus,

    pub players: Vec<PlayerClassIdentifier>,
    pub cards: CardState,
}

//State method didn't execute correctly
#[derive(Debug, Clone)]
pub enum StateMethodError {
    WrongStatus,                 //Recoverable, just wait for status to change
    InternalError(RuntimeError), //Fatal
}

#[derive(Debug, Clone)]
pub enum RuntimeError {
    Init(InitError),
    MissingResource(MissingResourceError),
}

#[derive(Debug, Clone)]
pub enum InitError {
    Zone(ZoneClassIdentifier),
    Player(PlayerClassIdentifier),
}

#[derive(Debug, Clone)]
pub enum MissingResourceError {
    Player(PlayerOrderIndex),
    Card(u64),
    Zone(GameZoneID),
}

impl GameState {
    pub fn new(config: Arc<config::GameConfig>) -> Self {
        Self {
            config: config.clone(),
            players: Vec::new(),
            status: GameStatus::Waiting(GameWaitingStatus::NotReady),
            cards: CardState::new(config.clone()),
        }
    }

    //TODO
    pub fn check_config(&self) -> Result<(), String> {
        Ok(())
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
            for (name, class) in self.config.initial_zones.iter() {
                match self
                    .cards
                    .create_zone(Vec::new(), &class, None, Some(name.clone()))
                {
                    Ok(_) => (),
                    Err(s) => {
                        return Err(StateMethodError::InternalError(s));
                    }
                }
            }

            //Set up player zones
            for (idx, player_class_name) in self.players.iter().enumerate() {
                if let Some(player_class) = self.config.player_classes.get(player_class_name) {
                    for zone_name in player_class.active_zones.iter() {
                        if let Some(zone_class_name) = self.config.player_zones.get(zone_name) {
                            match self.cards.create_zone(
                                Vec::new(),
                                &zone_class_name,
                                Some(GameZoneOwnership {
                                    player: idx as u64,
                                    zone_name: Some(zone_name.clone()),
                                }),
                                None,
                            ) {
                                Ok(_) => (),
                                Err(s) => {
                                    return Err(StateMethodError::InternalError(s));
                                }
                            }
                        } else {
                            return Err(StateMethodError::InternalError(RuntimeError::Init(
                                InitError::Player(player_class_name.clone()),
                            )));
                        }
                    }
                } else {
                    return Err(StateMethodError::InternalError(RuntimeError::Init(
                        InitError::Player(player_class_name.clone()),
                    )));
                }
            }

            Ok(())
        } else {
            return Err(StateMethodError::WrongStatus);
        }
    }
}
