import axios from 'axios';

import { useQuery, useMutation } from '@tanstack/react-query'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { handleAxiosError } from '@client/utility'

import { useState } from 'react'

import type { RulesetListing } from '@client/types/schema/ruleset'
import type { Pagination } from '@client/types/schema/common'
import type { GameCreateRequest, GameInfo } from '@client/types/schema/game'

import PaginatedListing from '@components/paginatedListing'

import type { rulesetSelection } from '@client/utility'
import RulesetListingComponent from '@components/rulesetListing'

import Header from '@components/header.tsx'
import Footer from '@components/footer.tsx'
import styles from '@styles/utility.module.css'

import ReactPaginate from 'react-paginate';


export const Route = createFileRoute('/listing')({
	component: RouteComponent,
})

async function startNewGame(ruleset: string): Promise<GameInfo> {
	let req: GameCreateRequest = { id: BigInt(101) }
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

	const gameMutation = useMutation<GameInfo, Error, string>({ mutationFn: startNewGame })
	const [rulesetToEdit, setRulesetToEdit] = useState<string | null>(null);

	function handlePageChange(item: { selected: number }) {
		console.log(item.selected);
		setPagination({ ...pagination, page: item.selected })
	}

	function handleSelection(ruleset: rulesetSelection) {
		if (ruleset.action === "startGame") {
			gameMutation.mutate(ruleset.target);
		}
		if (ruleset.action === "edit") {
			setRulesetToEdit(ruleset.target);
		}
	}

	if (rulesetToEdit) {
		return <Navigate to="/rulesets/$rulesetId/edit" params={{ rulesetId: rulesetToEdit }} />
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
	if (rulesets.isPending) {
		return <span> Fetching lists... </span>
	}
	if (rulesets.isError) {
		return <span> Error: {rulesets.error.message} </span>
	}

	let pageCount = (rulesets.data.total / pagination.per_page);
	pageCount = Math.floor(pageCount);
	if (rulesets.data.total / pagination.per_page) {
		pageCount += 1;
	}

	return (
		<>
			<div className={styles.centerHor}>
				<div>
					<RulesetListingComponent listing={rulesets.data} selectRuleset={handleSelection} />
				</div>
				<div>
					<ReactPaginate
						containerClassName={styles.pagination}
						previousClassName={styles.paginationPrev}
						nextClassName={styles.paginationNext}
						activeClassName={styles.paginationActive}
						pageClassName={styles.paginationPage}
						forcePage={pagination.page}
						breakLabel="..."
						nextLabel="next >"
						onPageChange={handlePageChange}
						pageRangeDisplayed={2}
						pageCount={pageCount}
						previousLabel="< previous"
						renderOnZeroPageCount={undefined} />
				</div>
			</div>
		</>
	)
}
