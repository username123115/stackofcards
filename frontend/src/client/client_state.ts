import type { GameAction } from "@bindings/GameAction";
import type { GameStatus } from "@bindings/GameStatus";
import type { PlayerSnapshot } from "@bindings/PlayerSnapshot";
import type { GameSnapshot } from "@bindings/GameSnapshot";

export interface ClientStateInterface {
	status: GameStatus;
	players: PlayerSnapshot;
	actions: GameAction[];
	private_actions: GameAction[],
	playerId: String,
	isWaiting(): Boolean;
	isReady(): Boolean;
	isFirst(): Boolean;
	playerOrder(): Number | null;
	update(snapshot: GameSnapshot): ClientStateInterface;
}

export class ClientState implements ClientStateInterface {
	status: GameStatus;
	players: PlayerSnapshot;
	actions: GameAction[];
	private_actions: GameAction[];
	playerId: String;
	constructor(
		status: GameStatus,
		players: PlayerSnapshot,
		actions: GameAction[],
		private_actions: GameAction[],
		playerId: String
	) {
		this.status = status;
		this.players = players;
		this.private_actions = private_actions;
		this.actions = actions;
		this.playerId = playerId;
	}
	isWaiting(): Boolean {
		return typeof this.status === 'object' && 'Waiting' in this.status
	}
	isFirst(): Boolean {
		let ord = this.playerOrder();
		if (ord !== null) {
			return ord === 0;
		} else {
			return false;
		}
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
	update(snapshot: GameSnapshot): ClientState {
		const status = snapshot.status ?? this.status;
		const players = snapshot.players ?? this.players;
		const private_actions = snapshot.private_actions ?? this.private_actions;
		const actions = snapshot.actions ?? this.actions;

		return new ClientState(
			status,
			players,
			private_actions,
			actions,
			this.playerId,
		)
	}
}
