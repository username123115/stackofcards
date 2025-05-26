import axios from 'axios';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import type { RulesetDescriber } from '@bindings/RulesetDescriber'

import CreateGame from '@components/create_game'

export const Route = createFileRoute('/create-game')({
	component: RouteComponent,
})

async function fetchGameList(): Promise<Array<RulesetDescriber>> {
	try {
		const response = await axios.get<Array<RulesetDescriber>>('v1/rulesets');
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			throw new Error(error.response?.data?.message || error.message || 'Failed to acquire rulesets');
		} else {
			throw new Error("Unexpected error");
		}
	}

}

function RouteComponent() {

	const rulesets = useQuery({ queryKey: ['/v1/rulesets'], queryFn: fetchGameList })
	const [ruleset, setRuleset] = useState<RulesetDescriber | null>(null);

	// User has choosen a ruleset?
	if (ruleset) {
		return <span> Todo: make a request to server </span>
	}

	// Ask user to choose a ruleset instead
	if (rulesets.status === 'pending') {
		return <span> Fetching lists... </span>
	}
	if (rulesets.status === 'error') {
		return <span> Error: {rulesets.error.message} </span>
	}

	return (
		<>
			<CreateGame rulesets={rulesets.data} selectRuleset={(ruleset) => setRuleset(ruleset)} />

		</>
	)
}
