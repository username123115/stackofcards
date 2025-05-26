import axios from 'axios';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import type { RulesetDescriber } from '@bindings/RulesetDescriber'
import type { GameCreateRequest } from '@bindings/GameCreateRequest'
import type { GameInfo } from '@bindings/GameInfo'

import CreateGame from '@components/create_game'

export const Route = createFileRoute('/create-game')({
	component: RouteComponent,
})

function handleAxiosError(error: unknown, message: String): never {
	if (axios.isAxiosError(error)) {
		throw new Error(error.response?.data?.message || error.message || message);
	} else {
		throw new Error("Unexpected error");
	}
}

async function fetchGameList(): Promise<Array<RulesetDescriber>> {
	try {
		const response = await axios.get<Array<RulesetDescriber>>('v1/rulesets');
		return response.data;
	} catch (error) {
		handleAxiosError(error, "Failed to acquire rulesets");
	}

}

async function startNewGame(ruleset: RulesetDescriber): Promise<GameInfo> {
	let req: GameCreateRequest = { id: ruleset.identifier }
	try {
		const response = await axios.post<GameInfo>('/v1/rulesets', req);
		return response.data;
	} catch (error) {
		handleAxiosError(error, "Failed to start a new game");
	}
}

function RouteComponent() {

	const rulesets = useQuery({ queryKey: ['GET /v1/rulesets'], queryFn: fetchGameList })
	const gameMutation = useMutation<GameInfo, Error, RulesetDescriber>({ mutationFn: startNewGame })

	// User has choosen a ruleset, now we're waiting for a response from the server
	if (!gameMutation.isIdle) {
		if (gameMutation.isPending) {
			return <span> Sending selection to server... </span>
		}
		if (gameMutation.isError) {
			return <span> {gameMutation.error.message} </span>
		}
		if (gameMutation.isSuccess) {
			return <span> Success! Code {gameMutation.data.code} </span>
		}

	}

	// Ask user to choose a ruleset
	if (rulesets.status === 'pending') {
		return <span> Fetching lists... </span>
	}
	if (rulesets.status === 'error') {
		return <span> Error: {rulesets.error.message} </span>
	}

	return (
		<>
			<CreateGame rulesets={rulesets.data} selectRuleset={(ruleset) => gameMutation.mutate(ruleset)} />

		</>
	)
}
