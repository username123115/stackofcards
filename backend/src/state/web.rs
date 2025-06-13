use crate::engine::core::interpreter;
use std::collections::{HashMap, VecDeque};

use super::engine_wrapper::{
    handler::WebGameState, interface::WebgameRequest, status::InterpreterStatus,
};

use tokio::sync::mpsc;
use tracing::info;

#[derive(Debug)]
pub struct WebGame {
    state: WebGameState,
    rx: mpsc::UnboundedReceiver<WebgameRequest>,
}

impl WebGame {
    pub fn new() -> (Self, mpsc::UnboundedSender<WebgameRequest>) {
        let (tx, rx) = mpsc::unbounded_channel::<WebgameRequest>();

        let state = WebGameState {
            connections: HashMap::new(),
            player_order: Vec::new(),
            public_action_queue: VecDeque::new(),
            game: interpreter::game::Game::new(interpreter::example_config::gen_example_config()),
            status: InterpreterStatus::Setup,
        };

        (
            Self {
                state: state,
                rx: rx,
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
            // This is super stupid but it gets rid of a warning so who's the stupid one here
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
                    // let mut state = self.state.lock().unwrap();
                    // state.process_request(&msg);
                }
            }
        }

        {
            self.state.queue_chat(None, "Game is no longer running");
            self.state.broadcast(None);
        }
    }
}
