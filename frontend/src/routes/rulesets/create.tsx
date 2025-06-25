import axios from 'axios'
import { handleAxiosError } from '@client/utility'
import type { RulesetResult } from '@client/types/schema/ruleset'
import { useEffect } from 'react';

import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'

import Header from '@components/header.tsx'
import Footer from '@components/footer.tsx'
import styles from '@styles/utility.module.css'

export const Route = createFileRoute('/rulesets/create')({
	component: RouteComponent,
})

async function createRuleset(): Promise<RulesetResult> {
	try {
		const response = await axios.post<RulesetResult>('/v1/rulesets/new');
		return response.data;
	} catch (error) {
		handleAxiosError(error, "Failed to create ruleset");
	}
}

function RouteComponent() {

	return (
		<div className={styles.pageWrapper}>
			<Header />
			<InnerRouteComponent />
			<Footer />
		</div>
	)
}

function InnerRouteComponent() {
	const createMutation = useMutation<RulesetResult, Error, void>({
		mutationFn: createRuleset,
	});

	useEffect(() => {
		createMutation.mutate();
	}, []);

	console.log(createMutation.data);

	if (createMutation.isSuccess && createMutation.data) {
		const rulesetId = createMutation.data.ruleset_id;
		return <Navigate to="/rulesets/$rulesetId/edit" params={{ rulesetId: rulesetId }} />
	}
	if (createMutation.isPending) {
		return <span> Creating... </span>
	}
	if (createMutation.isError) {
		return <span> Error creating ruleset : {createMutation.error?.message || 'Unknown error'} </span>
	}
	return <span> Waiting </span>
}
