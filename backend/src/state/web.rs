use crate::engine::core::interpreter;
use interpreter::config;
use std::collections::{HashMap, VecDeque};

use super::engine_wrapper::{
    handler::WebGameState, interface::WebgameRequest, status::InterpreterStatus,
};

use std::fmt;

use tokio::{
    sync::mpsc,
    time::{Duration, sleep},
};

use tracing::info;

pub struct WebGame {
    pub state: WebGameState,
    pub rx: mpsc::UnboundedReceiver<WebgameRequest>,
    pub name: String,
    pub ruleset_id: uuid::Uuid,
}
impl fmt::Debug for WebGame {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("WebGame")
            .field("name", &self.name)
            .field("ruleset_id", &self.ruleset_id)
            .finish()
    }
}

impl WebGame {
    pub fn new(
        config: &config::GameConfig,
        name: &str,
        ruleset_id: &uuid::Uuid,
    ) -> (Self, mpsc::UnboundedSender<WebgameRequest>) {
        let (tx, rx) = mpsc::unbounded_channel::<WebgameRequest>();

        let state = WebGameState {
            connections: HashMap::new(),
            player_order: Vec::new(),
            public_action_queue: VecDeque::new(),
            game: interpreter::game::Game::new(config.clone()),
            status: InterpreterStatus::Setup,
        };

        (
            Self {
                state: state,
                rx: rx,
                name: name.to_string(),
                ruleset_id: ruleset_id.clone(),
            },
            tx,
        )
    }

    #[tracing::instrument]
    pub async fn run(mut self) {
        info!("Starting game");
        let mut game_valid: bool = true;
        while game_valid {
            match self.state.status {
                InterpreterStatus::PendingExecution => (),
                InterpreterStatus::InstructionDelay(_) => (),
                _ => (),
            }

            if self.state.is_crashed() {
                game_valid = false;
            }
            if !game_valid {
                break;
            }

            tokio::select! {
                Some(msg) = self.rx.recv() => {
                    info!("Processing a player request");
                    self.state.process_request(&msg);
                }
                _timed_out = sleep(Duration::from_secs(120)) => {
                    tracing::info!("Game has timed out, quitting");
                    game_valid = false;
                }
            }
        }

        {
            self.state.queue_chat(None, "Game is no longer running");
            self.state.broadcast(None);
        }
    }
}
