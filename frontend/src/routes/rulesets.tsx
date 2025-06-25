import axios from 'axios';

import { useQuery, useMutation } from '@tanstack/react-query'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { handleAxiosError } from '@client/utility'

import { useState } from 'react'

import type { RulesetListing } from '@client/types/schema/ruleset'
import type { Pagination } from '@client/types/schema/common'
import type { GameCreateRequest, GameInfo } from '@client/types/schema/game'

import type { RulesetSelection } from '@client/utility'

import Header from '@components/header.tsx'
import Footer from '@components/footer.tsx'
import styles from '@styles/utility.module.css'

export const Route = createFileRoute('/rulesets')({
	component: RouteComponent,
})

async function startNewGame(ruleset: bigint): Promise<GameInfo> {
	let req: GameCreateRequest = { id: ruleset }
	try {
		const response = await axios.post<GameInfo>('/v1/rulesets', req);
		return response.data;
	} catch (error) {
		handleAxiosError(error, "Failed to start a new game");
	}
}

async function getListing(pagination: Pagination): Promise<RulesetListing> {
	try {
		const response = await axios.get<RulesetListing>('/v1/rulesets', { params: pagination });
		return response.data;
	} catch (error) {
		handleAxiosError(error, "Couldn't list games");
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

	const [pagination, setPagination] = useState<Pagination>({ page: 0, per_page: 10 });
	const rulesets = useQuery({ queryKey: ['GET /v1/rulesets', pagination.page, pagination.per_page], queryFn: () => getListing(pagination) })
	const gameMutation = useMutation<GameInfo, Error, bigint>({ mutationFn: startNewGame })

	const [rulesetToEdit, setRulesetToEdit] = useState<bigint | null>(null);


	function handleSelection(ruleset: RulesetSelection) {
		if (ruleset.action === "CreateGame") {
			gameMutation.mutate(ruleset.selection);
		}
		if (ruleset.action === "Edit") {
			setRulesetToEdit(ruleset.selection);
		}
	}

	if (rulesetToEdit) {
		return <Navigate to="/rulesets/$rulesetId/edit" params={{ rulesetId: String(rulesetToEdit) }} />
	}

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
			</div>
		</>
	)
}
