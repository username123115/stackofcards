pub mod app; //Manipulation of global state
pub mod game_wrapper; //Wraps engine state + apis (this is TODO, not actually wrapping yet)
pub mod player;
pub mod web; //Thread listening and responding to websocket clients //Tracking active players in a web game
