import axios from 'axios';
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react';

import { createFileRoute, Navigate } from '@tanstack/react-router'
import { handleAxiosError } from '@client/utility'
import type { rulesetSelection } from '@client/utility'

import type { Pagination } from '@client/types/schema/common'
import type { RulesetListing } from '@client/types/schema/ruleset'


import Header from '@components/header.tsx'
import Footer from '@components/footer.tsx'
import styles from '@styles/utility.module.css'

import type { UserInfo } from '@client/types/schema/user'
import PaginatedListing from '@components/paginatedListing'

export const Route = createFileRoute('/user/$username')({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div className={styles.pageWrapper}>
			<Header />
			<InnerRouteComponent />
			<Footer />
		</div>
	)
}

async function getPlayer(username: String): Promise<UserInfo> {
	try {
		const response = await axios.get<UserInfo>(`/v1/users/by-name/${username}`);
		return response.data;
	} catch (error) {
		handleAxiosError(error, "Couldn't get user");
	}
}

async function getPlayerRulesets(userId: String, pagination: Pagination): Promise<RulesetListing> {
	try {
		const response = await axios.get<RulesetListing>(`/v1/users/by-id/${userId}/rulesets`, { params: pagination });
		return response.data;
	} catch (error) {
		handleAxiosError(error, "Couldn't fetch rulesets");
	}
}

function InnerRouteComponent() {
	const { username } = Route.useParams();
	const userQuery = useQuery({ queryKey: [username], queryFn: () => getPlayer(username) })
	const [rulesetToEdit, setRulesetToEdit] = useState<string | null>(null);
	const [rulesetToStart, setRulesetToStart] = useState<string | null>(null);

	function handleSelection(ruleset: rulesetSelection) {
		if (ruleset.action === "startGame") {
			setRulesetToStart(ruleset.target);
		}
		if (ruleset.action === "edit") {
			setRulesetToEdit(ruleset.target);
		}
	}

	if (rulesetToStart) {
		return <Navigate to="/rulesets/$rulesetId/start" params={{ rulesetId: rulesetToStart }} />
	}

	if (rulesetToEdit) {
		return <Navigate to="/rulesets/$rulesetId/edit" params={{ rulesetId: rulesetToEdit }} />
	}

	if (userQuery.isPending) {
		return <span> Fetching user info... </span>
	}
	if (userQuery.isError) {
		return <span> Error: {userQuery.error.message} </span>
	}
	const user_id = userQuery.data.user_id;

	return (
		<div className={styles.centerHor}>
			<h1> {username}'s Profile </h1>
			<h2> Rulesets </h2>
			<PaginatedListing initialPagination={{ page: 0, per_page: 10 }} fetcher={(p) => getPlayerRulesets(user_id, p)} selector={handleSelection} queryKey={[`GET /v1/users/${user_id}rulesets`]} />
		</div>)
}
