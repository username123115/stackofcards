use ts_rs::TS;

#[derive(TS, Debug, Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord)]
#[ts(export)]
pub enum GameVisibility {
    Waiting,
    Ready,
    InProgress,
    Finished,
    Aborted,
}
