import axios from 'axios'
import { createFileRoute, Navigate } from '@tanstack/react-router'

import { useQuery, useMutation } from '@tanstack/react-query'

import { handleAxiosError } from '@client/utility'

import Editor from '@pages/editor'

import Header from '@components/header.tsx'
import Footer from '@components/footer.tsx'
import styles from '@styles/utility.module.css'
import type { RulesetInfo, RulesetResult } from '@client/types/schema/ruleset'

export const Route = createFileRoute('/rulesets/$rulesetId/edit')({
	component: RouteComponent,
})

async function getConfig(rulesetId: String): Promise<RulesetInfo> {
	try {
		//TODO: Maybe sanatize rulesetId
		const response = await axios.get<RulesetInfo>(`/v1/rulesets/${rulesetId}`);
		return response.data;
	} catch (error) {
		handleAxiosError(error, "Ruleset not found");
	}
}

async function postConfig(rulesetId: String, rulesetInfo: RulesetInfo) {
	try {
		const response = await axios.post<RulesetResult>(`/v1/rulesets/${rulesetId}/edit`, rulesetInfo);
		return response.data;
	} catch (error) {
		handleAxiosError(error, "Ruleset not found");
	}
}

function RouteComponent() {
	const { rulesetId } = Route.useParams();

	async function fetchConfig() {
		return getConfig(rulesetId);
	}

	async function editConfig(ruleset: RulesetInfo) {
		return postConfig(rulesetId, ruleset);
	}

	const rulesetInfo = useQuery({ queryKey: [`GET /v1/rulesets/${rulesetId}`], queryFn: fetchConfig })
	const editMutation = useMutation<RulesetResult, Error, RulesetInfo>({ mutationFn: editConfig });

	function handleEditRuleset(rules: RulesetInfo) {
		editMutation.mutate(rules);
	}

	if (rulesetInfo.status === 'pending') {
		return <span> Fetching ruleset data... </span>
	}
	if (rulesetInfo.status === 'error') {
		return <span> Error: {rulesetInfo.error.message} </span>
	}

	let message: string | null = null;

	if (editMutation.isPending) {
		message = "Saving...";
	}
	if (editMutation.isError) {
		message = `Error: ${editMutation.error.message}`
	}
	if (editMutation.isSuccess) {
		if (editMutation.data.ruleset_id !== rulesetId) {
			return <Navigate to="/rulesets/$rulesetId/edit" params={{ rulesetId: editMutation.data.ruleset_id }} />
		}
	}

	return (
		<>
			<div className={styles.pageWrapper}>
				<Header />
				<Editor ruleset={rulesetInfo.data} message={message} saveRuleset={handleEditRuleset} />
				<Footer />
			</div>
		</>
	)
}
