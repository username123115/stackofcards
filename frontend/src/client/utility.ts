import axios from 'axios'

import type { GameConfig } from './types/engine/config'
import type { PlayerCommand } from './types/wss'


export function handleAxiosError(error: unknown, message: String): never {
	if (axios.isAxiosError(error)) {
		throw new Error(error.response?.data?.message || error.message || message);
	} else {
		throw new Error("Unexpected error");
	}
}

export type PlayerCommandCallback = (command: PlayerCommand) => void

export type rulesetAction = "startGame" | "edit"

export interface rulesetSelection {
	target: string,
	action: rulesetAction,
}


export function phasesFromConfig(config: GameConfig): string[] {
	return Object.keys(config.phases);
}

export function zonesFromConfig(config: GameConfig): string[] {
	return Object.keys(config.zone_classes);
}
