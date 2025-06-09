use super::types_instances::BaseNumberType;
use crate::engine::core::types;

// Get evaluated to types
pub enum Expression {
    NumberLiteral(BaseNumberType),

    SingleZone(types::zones::SingleZoneTarget),
    ZoneCollection(types::zones::MultiZoneTarget),

    Player(types::players::SinglePlayerTarget),
    PlayerCollection(types::players::MultiPlayerTarget),

    ZoneToNumber {
        zone: types::zones::SingleZoneTarget,
        ordering: types::cards::RankOrder,
    },
}
