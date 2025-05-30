use tokio::sync::mpsc;
use tokio_tungstenite::client_async;

use std::{
    collections::HashMap,
    net::SocketAddr,
    sync::{Arc, Mutex},
};

use serde::{Deserialize, Serialize};
use ts_rs::TS;

use tracing::{info, instrument};

/* type TX =
struct PlayerInfo {
    tx : TX;
}

type RoomMap = Arc<Mutex<HashMap<SocketAddr, PlayerInfo>>>; */
