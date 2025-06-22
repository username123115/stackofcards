use serde;
use uuid::Uuid;

pub struct AuthUser {
    pub user_id: Uuid,
}

#[derive(serde::Serialize, serde::Deserialize)]
struct AuthUserClaims {
    user_id: Uuid,
    /// Standard JWT `exp` claim.
    exp: i64,
}
