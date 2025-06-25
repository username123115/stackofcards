use serde::{Deserialize, Serialize};
use std::fmt;
use ts_rs::TS;

#[derive(TS, Serialize, Deserialize, Debug)]
#[ts(export)]
pub struct UserBody<T> {
    pub user: T,
}

#[derive(TS, Serialize, Deserialize)]
#[ts(export)]
pub struct NewUser {
    pub username: String,
    pub password: String,
}

#[derive(TS, Serialize, Deserialize)]
#[ts(export)]
pub struct LoginUser {
    pub username: String,
    pub password: String,
}

#[derive(TS, Serialize, Deserialize, Debug)]
#[ts(export)]
pub struct UserInfo {
    pub username: String,
    pub user_id: String,
}

impl fmt::Debug for NewUser {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("NewUser")
            .field("username", &self.username)
            .finish()
    }
}

impl fmt::Debug for LoginUser {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("LoginUser")
            .field("username", &self.username)
            .finish()
    }
}
