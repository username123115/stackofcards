import type { GameStatus } from "@bindings/GameStatus";

export function IsStatusWaiting(status: GameStatus): Boolean {
	return typeof status === 'object' && 'Waiting' in status
}

