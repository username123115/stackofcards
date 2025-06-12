import { IsStatusWaiting } from "@client/utility"
import type { GameSnapshot } from '@bindings/GameSnapshot'
import styles from './client.module.css'
//import utilityStyles from '@styles/utility.module.css'

export default function Client({ snapshot, playerId }: { snapshot: GameSnapshot, playerId: String }) {
	const playerOrder = snapshot.players?.players[String(playerId)]?.role?.order;

	if (snapshot.status) {
		if (IsStatusWaiting(snapshot.status)) {
			const isPlayerFirst = (playerOrder !== null) && Number(playerOrder) == 0;
			return (
				<>
					<Roster snapshot={snapshot} playerId={playerId} />
					{isPlayerFirst && (
						<div> This renders if you are the first player </div>
					)}
				</>
			)
		}
		return (<span> Todo </span>)
	}
	return (<span> Something is broken? </span>)
}


function Roster({ snapshot, playerId }: { snapshot: GameSnapshot, playerId: String }) {
	if (IsStatusWaiting(snapshot.status)) {
		const roster = snapshot!.players?.order.map((pid) => {
			const isPlayer = pid === playerId;
			const key = isPlayer + pid;
			const nick = snapshot.players?.players[pid]?.nickname;

			let role = snapshot.players?.players[pid]?.role?.role;
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
