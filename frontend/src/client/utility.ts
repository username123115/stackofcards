import axios from 'axios'
import type { PlayerCommand } from '@bindings/PlayerCommand'

export function handleAxiosError(error: unknown, message: String): never {
	if (axios.isAxiosError(error)) {
		throw new Error(error.response?.data?.message || error.message || message);
	} else {
		throw new Error("Unexpected error");
	}
}

export type PlayerCommandCallback = (command: PlayerCommand) => void

export interface RulesetSelection {
	selection: bigint,
	action: RulesetAction,
}
export type RulesetAction = "Edit" | "CreateGame"
