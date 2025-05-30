use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

use tokio::sync::mpsc;

#[derive(Clone)]
pub struct AppState {
    pub rooms: Arc<Mutex<HashMap<u64, mpsc::UnboundedSender<String>>>>,
}
