import axios from 'axios';

import { useQuery, useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { handleAxiosError } from '@client/utility'

import type { RulesetDescriber } from '@bindings/RulesetDescriber'
import type { GameCreateRequest } from '@bindings/GameCreateRequest'
import type { GameInfo } from '@bindings/GameInfo'

import CreateGame from '@pages/create_game'

import Header from '@components/header.tsx'
import Footer from '@components/footer.tsx'
import styles from '@styles/utility.module.css'

export const Route = createFileRoute('/create-game')({
	component: RouteComponent,
})


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
	return (
		<>
			<div className={styles.pageWrapper}>
				<Header />
				<div className={styles.centerDiv}>
					<InnerRouteComponent />
				</div>
				<Footer />
			</div>

		</>
	)
}

function InnerRouteComponent() {
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
			<div>
				<CreateGame rulesets={rulesets.data} selectRuleset={(ruleset) => gameMutation.mutate(ruleset)} />
			</div>
		</>
	)
}
