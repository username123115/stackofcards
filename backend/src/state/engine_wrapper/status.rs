#[derive(Clone, Debug)]
pub enum InterpreterStatus {
    Setup,                 //Initial state as a game loads
    PendingExecution,      //Some instructions need to be executed
    InstructionDelay(u64), //Delay some seconds (Spawn a task to decr each second)
    Blocked,               //Waiting on some external input from players
    Failed,                // Fatal error / crash
}
