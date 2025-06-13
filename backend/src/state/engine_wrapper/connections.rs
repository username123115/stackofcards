use super::wrapper;
use tokio::sync::mpsc;

#[derive(Clone, Debug)]
pub enum WebGameConnection {
    Connected(mpsc::UnboundedSender<wrapper::GameSnapshot>),
    Disconnected(u64),
}

#[derive(Clone, Debug)]
pub struct WebGamePlayer {
    pub nickname: String,
    pub conn: WebGameConnection,
}

impl WebGamePlayer {
    pub fn to_pinfo(&self, role: Option<wrapper::PlayerRole>) -> wrapper::PlayerInformation {
        wrapper::PlayerInformation {
            nickname: self.nickname.clone(),
            disconnected: match self.conn {
                WebGameConnection::Connected(_) => None,
                WebGameConnection::Disconnected(elapsed) => Some(elapsed),
            },
            role,
        }
    }
}
