// import { IsStatusWaiting } from "@client/utility"
// import type { GameSnapshot } from '@bindings/GameSnapshot'
import styles from './client.module.css'

import { ClientState } from "@client/client_state";

//import utilityStyles from '@styles/utility.module.css'

export default function Client({ state }: { state: ClientState }) {
	if (state.isWaiting()) {
		return (
			<>
				<Roster state={state} />
				{state.isFirst() && (
					<div> This renders if you are the first player </div>
				)}
			</>
		)
	}
	return (<span> Todo </span>)
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
				<div className={styles.rosterTitle}> Players </div>
				<ul>
					{roster}
				</ul>
			</div>
		)
	}
}
