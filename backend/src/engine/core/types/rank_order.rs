use super::{cards, ranks};
use cards::Card;
use ranks::Rank;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use ts_rs::TS;

#[derive(TS, Debug, Clone, Serialize, Deserialize)]
pub struct RankOrder {
    order: Vec<Rank>,
    rank_to_index: HashMap<Rank, usize>,
}

impl RankOrder {
    pub fn new(order: Vec<Rank>) -> Self {
        let rank_to_index: HashMap<Rank, usize> = order
            .iter()
            .enumerate()
            .map(|(index, rank)| (*rank, index))
            .collect();
        Self {
            order,
            rank_to_index,
        }
    }

    pub fn get_index(&self, card: Card) -> usize {
        *self.rank_to_index.get(&card.rank).unwrap()
    }
}
