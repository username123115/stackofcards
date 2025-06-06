import type { GameSnapshot } from '@bindings/GameSnapshot'

export default function Client({ snapshot, player_id }: { snapshot: GameSnapshot, player_id: String }) {
	if (snapshot.status === "Waiting") {
		//List players
		if (snapshot.players) {
			const players = snapshot.players.order.filter((value) => snapshot.players!.players[value]
			return (
				<>
					<div>
					</div>
				</>
			)
		}
	}
}

