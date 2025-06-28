import axios from 'axios';
import { createFileRoute } from '@tanstack/react-router'

import { useMutation } from '@tanstack/react-query'
import { handleAxiosError } from '@client/utility'
import type { NewGame, GameInfo } from '@client/types/schema/game'

import { useEffect } from 'react'

import Centered from '@components/centeredSocs'
import styles from '@styles/utility.module.css'

export const Route = createFileRoute('/rulesets/$rulesetId/start')({
	component: RouteComponent,
})

async function startNewGame(ruleset: string): Promise<GameInfo> {
	let req: NewGame = { ruleset_id: ruleset }
	try {
		const response = await axios.post<GameInfo>('/v1/games/new', req);
		return response.data;
	} catch (error) {
		handleAxiosError(error, "Failed to start a new game");
	}
}

function RouteComponent() {
	return <Centered innerClassname={styles.centerDiv} >
		<InnerRouteComponent />
	</Centered>
}

function InnerRouteComponent() {
	const { rulesetId } = Route.useParams();
	const gameMutation = useMutation<GameInfo, Error, string>({ mutationFn: startNewGame })

	useEffect(() => {
		gameMutation.mutate(rulesetId);
	}, [rulesetId]);

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


	return <span> Joining </span>

}

