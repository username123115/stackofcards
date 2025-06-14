import axios from 'axios'
import { createFileRoute } from '@tanstack/react-router'

import { useQuery } from '@tanstack/react-query'

import type { GameConfig } from '@bindings/GameConfig'
import { handleAxiosError } from '@client/utility'

import Editor from '@pages/editor'

export const Route = createFileRoute('/rulesets/$rulesetId/edit')({
	component: RouteComponent,
})

async function fetchConfig(rulesetId: String): Promise<GameConfig> {
	try {
		//TODO: Maybe sanatize rulesetId
		const response = await axios.get<GameConfig>(`/v1/rulesets/${rulesetId}`);
		return response.data;
	} catch (error) {
		handleAxiosError(error, "Ruleset not found");
	}
}

function RouteComponent() {
	const { rulesetId } = Route.useParams();

	async function getConfig() {
		return fetchConfig(rulesetId);
	}

	const config = useQuery({ queryKey: [`GET /v1/rulesets/${rulesetId}`], queryFn: getConfig })

	if (config.status === 'pending') {
		return <span> Fetching ruleset data... </span>
	}
	if (config.status === 'error') {
		return <span> Error: {config.error.message} </span>
	}

	return (
		<>
			<div>
				<Editor config={config.data} />
			</div>
		</>
	)
}
