import type { GameSnapshot } from '@bindings/GameSnapshot'
import style from './client.module.css'

export default function Client({ snapshot, playerId }: { snapshot: GameSnapshot, playerId: String }) {
	if (snapshot.status) {
		return (
			<Roster snapshot={snapshot} playerId={playerId} />
		)
	}
	return (
		<>
			<p> TODO </p>
		</>
	)
}


function Roster({ snapshot, playerId }: { snapshot: GameSnapshot, playerId: String }) {
	if (typeof snapshot.status === 'object' && 'Waiting' in snapshot.status) {
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
				<li key={key + display} className={isPlayer ? style.rosterSelf : style.rosterOther}>
					{display}
				</li>
			)
		})
		return (
			<ul className={style.roster}>
				{roster}
			</ul>
		)
	}
}
