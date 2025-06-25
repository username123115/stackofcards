import type { Pagination } from '@client/types/schema/common'
import type { RulesetListing } from '@client/types/schema/ruleset'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { rulesetSelection } from '@client/utility'
import RulesetListingComponent from '@components/rulesetListing'
import ReactPaginate from 'react-paginate';
import styles from '@styles/utility.module.css'

export type FetcherFunction = ((pagination: Pagination) => Promise<RulesetListing>)

export default function paginatedListing({ initialPagination, fetcher, selector, queryKey }:
	{ initialPagination: Pagination, fetcher: FetcherFunction, selector: ((selection: rulesetSelection) => void), queryKey: string[] }) {

	const [pagination, setPagination] = useState<Pagination>(initialPagination);
	const rulesets = useQuery({ queryKey: [...queryKey, pagination.per_page, pagination.page], queryFn: () => fetcher(pagination) })

	function handlePageChange(item: { selected: number }) {
		setPagination({ ...pagination, page: item.selected })
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
					<RulesetListingComponent listing={rulesets.data} selectRuleset={selector} />
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
