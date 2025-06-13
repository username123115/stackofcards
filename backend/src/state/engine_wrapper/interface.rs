use super::wrapper;
use tokio::sync::mpsc;

pub struct WebgameJoin {
    pub nickname: Option<String>,
    pub tx: mpsc::UnboundedSender<wrapper::GameSnapshot>,
}

pub enum WebgameRequestBody {
    Join(WebgameJoin),
    Disconnect,
    PlayerCommand(wrapper::PlayerCommand),
}

pub struct WebgameRequest {
    pub body: WebgameRequestBody,
    pub player_id: wrapper::PlayerId,
}
