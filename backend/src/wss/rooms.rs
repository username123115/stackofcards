use uuid::Uuid;

use axum::{
    extract::{
        Path, State, WebSocketUpgrade,
        ws::{Message, WebSocket},
    },
    http::StatusCode,
    response::IntoResponse,
};

use crate::state;
use state::engine_wrapper::{interface, wrapper};
use tokio::{
    sync::mpsc,
    time::{Duration, sleep},
};
use tracing::{info, instrument};

use serde_json;

#[instrument]
pub async fn join_handler(
    Path(room): Path<u64>,
    ws: WebSocketUpgrade,
    State(state): State<state::app::AppState>,
) -> impl IntoResponse {
    let rooms_map = state.rooms.lock().unwrap();
    let game_tx_option = rooms_map.get(&room).cloned();
    // Drop lock
    drop(rooms_map);

    if let Some(game_tx) = game_tx_option {
        info!("Room {room} found, upgrading connection");

        return ws.on_upgrade(|websocket| async move {
            match WebgameClient::join(websocket, game_tx) {
                Ok(client) => {
                    info!("Spawning a client");
                    tokio::spawn(client.handle_connection());
                }
                Err(e) => tracing::error!("Client failed to join room: {e}"),
            };
        });
    } else {
        (StatusCode::NOT_FOUND, "Room not found").into_response()
    }
}

// Middle man that connects a websocket connection to the central game thread
pub struct WebgameClient {
    pub ws: WebSocket,
    pub tx: mpsc::UnboundedSender<interface::WebgameRequest>,
    pub rx: mpsc::UnboundedReceiver<wrapper::GameSnapshot>,
    pub uuid: Uuid,
    pub running: bool,
}

impl WebgameClient {
    pub fn join(
        ws: WebSocket,
        tx: mpsc::UnboundedSender<interface::WebgameRequest>,
    ) -> Result<Self, String> {
        //TODO: W/db UUID can be gleaned from a user
        let uuid = Uuid::new_v4();

        let (tx_self, rx) = mpsc::unbounded_channel::<wrapper::GameSnapshot>();
        let new_client = Self {
            ws,
            tx: tx.clone(),
            rx,
            uuid,
            running: true,
        };

        let join_request = interface::WebgameRequest {
            body: interface::WebgameRequestBody::Join(interface::WebgameJoin {
                nickname: None, //TODO
                tx: tx_self,
            }),
            player_id: uuid.into(),
        };

        if let Err(_) = tx.send(join_request) {
            return Err("Couldn't contact game".into());
        }

        Ok(new_client)
    }

    pub fn send_request(&mut self, request: interface::WebgameRequestBody) {
        let req = interface::WebgameRequest {
            body: request,
            player_id: self.uuid.into(),
        };
        if let Err(_) = self.tx.send(req) {
            self.on_game_connection_lost();
        }
    }

    pub fn leave_game(&mut self) {
        self.running = false;
        self.send_request(interface::WebgameRequestBody::Disconnect);
    }

    fn on_game_connection_lost(&mut self) {
        tracing::error!("Sending to a disconnected channel");
        // Don't call leave_game, there is no game to send the disconnect messsage to
        self.running = false;
    }

    // Forward any snapshots
    async fn handle_connection_rx(&mut self, snapshot: &wrapper::GameSnapshot) {
        match serde_json::to_string(&snapshot) {
            Ok(json_msg) => {
                if let Err(e) = self.ws.send(Message::Text(json_msg.into())).await {
                    let client_id = self.uuid.clone();
                    tracing::error!("Failed to send snapshot to client {client_id}: {e}");
                }
            }
            Err(e) => tracing::error!("Failed to serialize snapshot: {e}"),
        }
    }

    async fn handle_connection_tx(&mut self, request: Option<Result<Message, axum::Error>>) {
        match request {
            Some(Ok(message)) => self.handle_websocket_message(message).await,
            Some(Err(err)) => {
                tracing::error!("Error receiving message from websocket connection: {err}");
                self.leave_game();
            }
            None => self.leave_game(),
        }
    }

    async fn handle_websocket_message(&mut self, message: Message) {
        match message {
            Message::Binary(_) => tracing::warn!("Unexpected binary message, ignoring"),
            Message::Ping(payload) => {
                if let Err(e) = self.ws.send(Message::Pong(payload)).await {
                    tracing::error!("Failed to send pong to client : {e}");
                    self.leave_game();
                }
            }
            Message::Pong(_) => (),
            Message::Close(_) => {
                tracing::info!("Websocket closing");
                self.leave_game();
            }
            Message::Text(request) => {
                match serde_json::from_str::<wrapper::PlayerCommand>(&request) {
                    Ok(command) => {
                        self.send_request(interface::WebgameRequestBody::PlayerCommand(command))
                    }
                    Err(e) => {
                        tracing::warn!("Failed to deserialize client message {request}: {e}");
                    }
                }
            }
        }
    }

    pub async fn handle_connection(mut self) {
        let client_uuid = self.uuid;
        tracing::info!("Starting websocket handler for client {client_uuid}");
        while self.running {
            tokio::select! {
                //TODO: may need to add a timeout? Also maybe drop snapshots and take only most
                //recent
                Some(snapshot) = self.rx.recv() => {self.handle_connection_rx(&snapshot).await}
                ws_msg = self.ws.recv() => {self.handle_connection_tx(ws_msg).await}
                _timed_out = sleep(Duration::from_secs(60)) => {
                    tracing::info!("Connection timed out, no messages received in heartbeat window");
                    self.leave_game()
                }
            }
        }

        tracing::info!("Websocket connection ending");
    }
}
