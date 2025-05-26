import { createFileRoute } from '@tanstack/react-router'
import axios from 'axios';

import { useQuery } from '@tanstack/react-query'
import type { RulesetDescriber } from '@bindings/RulesetDescriber'

import CreateGame from '@components/create_game'

export const Route = createFileRoute('/create-game')({
	component: RouteComponent,
})

function RouteComponent() {
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

	const rulesets = useQuery({ queryKey: ['rulesets'], queryFn: fetchGameList })

	if (rulesets.status === 'pending') {
		return <span> Fetching lists... </span>
	}
	if (rulesets.status === 'error') {
		return <span> Error: {rulesets.error.message} </span>
	}

	return (
		<>
			<CreateGame rulesets={rulesets.data} />

		</>
	)
}
