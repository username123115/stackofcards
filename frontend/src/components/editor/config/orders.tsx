import type { GameConfig } from '@client/types/engine/config'
import type { RankOrder, Rank } from '@client/types/engine/core'

import styles from "./config.module.css"

import { ConfigItemList, } from './utility'
import type { ModifiableConfigProps } from './utility'

export default function OrderList({ config, handleEditOrders }: { config: GameConfig, handleEditOrders: ((n: GameConfig['orders']) => void) | null }) {
	let defaultOrder: RankOrder = { order: [], rank_to_index: {}, };
	return <ConfigItemList Component={OrderDisplayWrapper} config={config} contents={config['orders']} defaultItem={() => defaultOrder} updateContents={handleEditOrders} prefix={"new_order"} />

}

function OrderDisplayWrapper(props: ModifiableConfigProps<RankOrder>) {
	return <OrderDisplay config={props.config} order={props.configItem} editOrder={props.setConfigItem} />
}

function OrderDisplay({ config, order, editOrder }:
	{ config: GameConfig, order: RankOrder, editOrder: ((order: RankOrder) => void) | null }) {

	function ModifyRank(rank: Rank, diff: number) {
		if (editOrder && order.rank_to_index[rank]) {
			const currentNum = order.rank_to_index[rank];
			const newRankToIndex = { ...order.rank_to_index, [rank]: currentNum + diff };
			editOrder({ ...order, rank_to_index: newRankToIndex });
		}
	}

	function RemoveRank(rank: Rank) {
		if (editOrder && order.rank_to_index[rank]) {
			const newRankToIndex = { ...order.rank_to_index };
			delete newRankToIndex[rank];
			editOrder({ ...order, rank_to_index: newRankToIndex });
		}
	}

	const rankList = Object.entries(order.rank_to_index).sort(
		(a, b) => {
			if (a[1] < b[1]) return -1;
			if (a[1] === b[1]) return 0;
			return 1;
		})

	const highestOrder = rankList.length ? rankList[rankList.length - 1][1] : 0;

	function AddRanks(ranks: Rank[]) {
		if (!editOrder) return;

		let curHighest = highestOrder;
		const newRankToIndex = { ...order.rank_to_index };

		ranks.forEach(rank => {
			// Only add if the rank isn't already present
			if (newRankToIndex[rank] === undefined) {
				newRankToIndex[rank] = curHighest + 1;
				curHighest += 1;
			}
		});

		editOrder({ ...order, rank_to_index: newRankToIndex });
	}

	const placements = rankList.map(
		([rank, index]) => {
			return (
				<li key={`${rank} ${index}`}>
					<div className={styles.listItem}>
						<div className={styles.horizontalList}>
							{editOrder && <button className={styles.invisibleButton} onClick={() => ModifyRank(rank as Rank, -1)}> &lt; </button>}
							<span> {rank} </span>
							<span> [{index}] </span>
							{editOrder && <button className={styles.invisibleButton} onClick={() => ModifyRank(rank as Rank, 1)}> &gt; </button>}
							{editOrder && <button className={styles.invisibleButton} onClick={() => RemoveRank(rank as Rank)}> x </button>}
						</div>
					</div>
				</li>
			)
		}
	)

	return (
		<div className={styles.fieldListing}>
			<ul className={styles.horizontalList}>
				{placements}
			</ul>
			{editOrder &&
				<div className={styles.rounded}>
					<select value={undefined} onChange={
						(e) => {
							if (!e.target.value) return;
							if (e.target.value === "ALL") {
								AddRanks(config.allowed_ranks);
							} else {
								const toAdd = e.target.value as Rank;
								if (order.rank_to_index[toAdd]) return;
								const newRankToIndex = { ...order.rank_to_index, [toAdd]: highestOrder + 1 }
								editOrder && editOrder({ ...order, rank_to_index: newRankToIndex })
							}
						}
					}>
						<option value={undefined}> </option>
						{config.allowed_ranks.map(
							(option) => (<option key={option} value={option}> {option} </option>)
						)}
						<option key={"Select All"} value="ALL"> All Ranks </option>

					</select>
				</div>
			}
		</div>
	)
}
