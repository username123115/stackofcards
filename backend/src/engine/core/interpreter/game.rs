use super::lang::{expressions, phases, statements, types_instances};
use crate::engine::core::types::{cards, identifiers::*, patterns, players, zones};

use std::collections::{HashMap, HashSet};

pub struct GameConfig {
    pub allowed_ranks: HashSet<cards::Rank>,
    pub allowed_suits: HashSet<cards::Suit>,
    pub orders: HashMap<cards::OrderIdentifier, cards::RankOrder>,
    pub patterns: HashMap<patterns::PatternIdentifier, patterns::Pattern>,

    pub phases: HashMap<PhaseIdentifier, phases::Phase>,
    pub zone_classes: HashMap<ZoneClassIdentifier, zones::ZoneClass>,
    pub player_classes: HashMap<PlayerClassIdentifier, players::PlayerClass>,
    // For each player, game will go in order of this list and find the first class that matches
    pub player_assignment: Vec<PlayerClassIdentifier>,
    pub initial_zones: HashMap<VariableIdentifier, ZoneClassIdentifier>, //Engine sets these up first and

    pub initial_phase: PhaseIdentifier,
}

pub struct ExecutionContext {
    statements_evaluated: u64,
    statement_limit: u64,
}

impl ExecutionContext {
    pub fn new() -> Self {
        Self {
            statements_evaluated: 0,
            statement_limit: 1000,
        }
    }
}

pub type GameZoneID = u64;
pub type PlayerOrderIndex = u64;

struct GamePlayerState {
    zones: HashMap<VariableIdentifier, GameZoneID>,
    owned_zones: HashSet<GameZoneID>,
    class: PlayerClassIdentifier,
}

struct GameZoneState {
    cards: Vec<u64>,
    class: ZoneClassIdentifier,
    owner: Option<PlayerOrderIndex>,
}

impl GameZoneState {
    pub fn new(
        cards: Vec<u64>,
        class: &ZoneClassIdentifier,
        owner: Option<PlayerOrderIndex>,
    ) -> Self {
        Self {
            cards,
            class: class.clone(),
            owner,
        }
    }
}

pub struct Game {
    config: GameConfig,
    cards_created: u64,
    cards: HashMap<u64, cards::Card>,

    zones_created: GameZoneID,
    zones: HashMap<GameZoneID, GameZoneState>,
    // These mappings may point to nonexistant zones so check on indexing
    zone_class_mappings: HashMap<ZoneClassIdentifier, HashSet<GameZoneID>>,
    zone_name_mappings: HashMap<VariableIdentifier, GameZoneID>,

    ex_ctx: ExecutionContext,

    players: Vec<GamePlayerState>,
}

impl Game {
    pub fn new(config: GameConfig) -> Self {
        Self {
            config,
            cards_created: 0,
            cards: HashMap::new(),

            zones_created: 0,
            zones: HashMap::new(),

            ex_ctx: ExecutionContext::new(),
            zone_class_mappings: HashMap::new(),
            zone_name_mappings: HashMap::new(),

            players: Vec::new(),
        }
    }

    // Identify zones by owner (Players will hold references)
    // Identify zones by class
    //

    pub fn init(&mut self) {
        let mut zone_init_result: Result<(), String> = Ok(());
        for (zone_name, zone_class) in self.config.initial_zones.iter() {
            // Empty zone owned by nobody
            match self.create_zone(Vec::new(), zone_class) {
                Ok(zone_id) => (),
                Err(msg) => {
                    zone_init_result = Err(msg);
                }
            }
        }
    }

    pub fn create_zone(
        &mut self,
        cards: Vec<u64>,
        class: &ZoneClassIdentifier,
    ) -> Result<GameZoneID, String> {
        if let Some(_) = self.config.zone_classes.get(class) {
            let z = GameZoneState::new(cards, class, None);

            // Add to pool
            let zone_id = self.new_zone_id();
            self.zones.insert(zone_id, z);
            let zone_set_opt = self.zone_class_mappings.get_mut(class);

            // Add to class mappings
            if let Some(zone_set) = zone_set_opt {
                zone_set.insert(zone_id);
            } else {
                let mut new_zone_set = HashSet::new();
                new_zone_set.insert(zone_id);
                self.zone_class_mappings.insert(class.clone(), new_zone_set);
            }

            return Ok(zone_id);
        } else {
            return Err("Zone creator used nonexistant class".into());
        }
    }

    pub fn new_zone_id(&mut self) -> GameZoneID {
        self.zones_created += 1;
        self.zones_created
    }

    pub fn new_card_id(&mut self) -> u64 {
        self.cards_created += 1;
        self.cards_created
    }

    pub fn lookup_single_zone(&self, target: &zones::SingleZoneTarget) -> VariableIdentifier {
        todo!("IMPLEMENT ME");
    }

    pub fn lookup_multi_zone(&self, target: &zones::MultiZoneTarget) -> Vec<VariableIdentifier> {
        todo!("IMPLEMENT ME");
    }

    pub fn lookup_zones(&self, target: &zones::ZoneTarget) -> Vec<VariableIdentifier> {
        match target {
            zones::ZoneTarget::Single(s) => vec![self.lookup_single_zone(s)],
            zones::ZoneTarget::Multiple(m) => self.lookup_multi_zone(m),
        }
    }

    pub fn lookup_single_player(&self, target: &players::SinglePlayerTarget) -> VariableIdentifier {
        todo!("IMPLEMENT ME");
    }

    pub fn lookup_multi_players(
        &self,
        target: &players::MultiPlayerTarget,
    ) -> Vec<VariableIdentifier> {
        todo!("IMPLEMENT ME");
    }

    pub fn lookup_players(&self, target: &players::PlayerTarget) -> Vec<VariableIdentifier> {
        match target {
            players::PlayerTarget::Single(s) => vec![self.lookup_single_player(s)],
            players::PlayerTarget::Multiple(m) => self.lookup_multi_players(m),
        }
    }

    pub fn on_reached_eval_limit(&mut self) {
        self.throw_error("Evaluation limit reached".into());
    }

    pub fn throw_error(&mut self, reason: String) {}

    pub fn evaluate_statement(&mut self, statement: &statements::Statement) {
        self.ex_ctx.statements_evaluated += 1;
        if self.ex_ctx.statements_evaluated > self.ex_ctx.statement_limit {
            self.on_reached_eval_limit();
            return;
        }
    }

    pub fn evaluate_number(
        &self,
        expr: &expressions::NumberExpression,
    ) -> types_instances::BaseNumberType {
        use expressions::NumberExpression::*;
        match expr {
            NumberLiteral(n) => *n,
            SumZones { zone, ordering } => todo!("IMPLEMENT ME"),
        }
    }

    pub fn evaluate_bool(&self, expr: &expressions::BooleanExpression) -> bool {
        use expressions::BooleanExpression::*;
        match expr {
            BooleanLiteral(b) => *b,
            Comparison { a, compared_to, b } => {
                let va = self.evaluate_number(a);
                let vb = self.evaluate_number(b);
                use expressions::Comparison::*;
                match compared_to {
                    GT => va > vb,
                    LT => va < vb,
                    GTE => va >= vb,
                    LTE => va <= vb,
                    Eq => va == vb,
                }
            }
        }
    }

    pub fn evaluate_zone(&self, expr: &expressions::ZoneExpression) -> VariableIdentifier {
        use expressions::ZoneExpression::*;
        match expr {
            SingleZone(z) => self.lookup_single_zone(z),
        }
    }

    pub fn evaluate_zone_collection(
        &self,
        expr: &expressions::ZoneCollectionExpression,
    ) -> Vec<VariableIdentifier> {
        use expressions::ZoneCollectionExpression::*;
        match expr {
            ZoneCollection(zt) => self.lookup_zones(zt),
        }
    }

    pub fn evaluate_player(&self, expr: &expressions::PlayerExpression) -> VariableIdentifier {
        use expressions::PlayerExpression::*;
        match expr {
            Player(p) => self.lookup_single_player(p),
        }
    }

    pub fn evaluate_player_collection(
        &self,
        expr: &expressions::PlayerCollectionExpression,
    ) -> Vec<VariableIdentifier> {
        use expressions::PlayerCollectionExpression::*;
        match expr {
            PlayerCollection(pt) => self.lookup_players(pt),
        }
    }
}
