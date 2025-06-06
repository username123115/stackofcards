import type { GameSnapshot } from '@bindings/GameSnapshot'
import style from './client.module.css'

export default function Client({ snapshot, playerId }: { snapshot: GameSnapshot, playerId: String }) {
	if (snapshot.status === "Waiting") {
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
	if (snapshot.players && snapshot.status === "Waiting") {
		const roster = snapshot.players.order.map((pid) => {
			const isPlayer = pid === playerId;
			const key = isPlayer + pid;
			const nick = snapshot.players?.players[pid]?.nickname;
			return (
				<li key={key} className={isPlayer ? style.rosterSelf : style.rosterOther}>
					{nick}
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
