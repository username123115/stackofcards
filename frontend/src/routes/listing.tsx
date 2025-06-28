import axios from 'axios';

import { createFileRoute, Navigate } from '@tanstack/react-router'
import { handleAxiosError } from '@client/utility'

import { useState } from 'react'

import type { RulesetListing } from '@client/types/schema/ruleset'
import type { Pagination } from '@client/types/schema/common'

import PaginatedListing from '@components/paginatedListing'

import type { rulesetSelection } from '@client/utility'

import Centered from '@components/centeredSocs'
import styles from '@styles/utility.module.css'


export const Route = createFileRoute('/listing')({
	component: RouteComponent,
})

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
			<Centered innerClassname={styles.centerDiv}>
				<InnerRouteComponent />
			</Centered>

		</>
	)
}

function InnerRouteComponent() {
	const [rulesetToEdit, setRulesetToEdit] = useState<string | null>(null);
	const [rulesetToStart, setRulesetToStart] = useState<string | null>(null);


	if (rulesetToStart) {
		return <Navigate to="/rulesets/$rulesetId/start" params={{ rulesetId: rulesetToStart }} />
	}

	function handleSelection(ruleset: rulesetSelection) {
		if (ruleset.action === "startGame") {
			setRulesetToStart(ruleset.target);
		}
		if (ruleset.action === "edit") {
			setRulesetToEdit(ruleset.target);
		}
	}

	if (rulesetToEdit) {
		return <Navigate to="/rulesets/$rulesetId/edit" params={{ rulesetId: rulesetToEdit }} />
	}


	return <PaginatedListing initialPagination={{ page: 0, per_page: 10 }} fetcher={getListing} selector={handleSelection} queryKey={["GET /v1/rulesets"]} />
}
