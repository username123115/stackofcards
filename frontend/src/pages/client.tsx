import styles from './client.module.css'
import type { PlayerCommand } from '@bindings/PlayerCommand'
import type { PlayerCommandCallback } from '@client/utility'

import { ClientState } from "@client/client_state";

//import utilityStyles from '@styles/utility.module.css'

export default function Client({ state, setCommand }: { state: ClientState, setCommand: PlayerCommandCallback }) {
	function RequestBegin() {
		setCommand("StartGame");
	}
	if (state.isWaiting()) {
		return <Waiting state={state} signalStart={RequestBegin} />
	}
	return (<span> Todo </span>)
}

function Waiting({ state, signalStart }: { state: ClientState, signalStart: (() => void) }) {
	return (
		<>
			<div>
				<div className={styles.statusBar}>
					{state.isReady() ? "Waiting for host to start game" : "Waiting for players"}
				</div>
				<div className={styles.container}>
					<div className={styles.title}> Players </div>
					<Roster state={state} />
					{state.isFirst() && (<StartButton />)}
				</div>
			</div>
		</>
	)

	function StartButton() {
		return (
			<button disabled={!state.isReady()} onClick={signalStart}>
				{state.isReady() ? "Start Game" : "Waiting for players"}
			</button>
		);
	}

}


function Roster({ state }: { state: ClientState }) {
	if (state.isWaiting()) {
		const roster = state.players.order.map((pid) => {
			const isPlayer = pid === state.playerId;
			const key = isPlayer + pid;
			const nick = state.players.players[pid]?.nickname;

			let role = state.players.players[pid]?.role?.role;
			if (role) {
				role = "(" + role + ")";
			}
			const display = (nick ? nick : "") + (role ? role : "");
			// This is really gross, lgtm
			return (
				<li key={key + display} className={isPlayer ? styles.rosterSelf : styles.rosterOther}>
					<span> {display} </span>
				</li>
			)
		})
		return (
			<div className={styles.roster}>
				<ul>
					{roster}
				</ul>
			</div>
		)
	}
}
