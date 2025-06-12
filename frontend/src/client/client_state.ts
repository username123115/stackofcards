import type { GameAction } from "@bindings/GameAction";
import type { GameStatus } from "@bindings/GameStatus";
import type { PlayerSnapshot } from "@bindings/PlayerSnapshot";

export interface ClientStateInterface {
	status: GameStatus;
	players: PlayerSnapshot;
	actions: GameAction[];
	playerId: String,
	isWaiting(): Boolean;
	isReady(): Boolean;
	playerOrder(): Number | null;
}

export class ClientState implements ClientStateInterface {
	status: GameStatus;
	players: PlayerSnapshot;
	actions: GameAction[];
	playerId: String;
	constructor(
		status: GameStatus,
		players: PlayerSnapshot,
		actions: GameAction[],
		playerId: String
	) {
		this.status = status;
		this.players = players;
		this.actions = actions;
		this.playerId = playerId;
	}
	isWaiting(): Boolean {
		return typeof this.status === 'object' && 'Waiting' in this.status
	}
	isReady(): Boolean {
		if (typeof this.status === 'object' && 'Waiting' in this.status) {
			const waitingEnum = this.status.Waiting;
			return waitingEnum === "Ready";
		} else {
			return false;
		}
	}
	playerOrder(): Number | null {
		const r = this.players.players[String(this.playerId)]?.role?.order;
		if (r !== undefined) {
			return Number(r)
		} else {
			return null;
		}
	}
}
