import type { GameConfig } from '@bindings/GameConfig';
import type { RankOrder } from "@bindings/RankOrder";
import type { Rank } from "@bindings/Rank";
import styles from "./config.module.css";

import { NameFieldComponent, renameProperty } from './utility'


interface OrderListProps {
	config: GameConfig;
	handleEditOrders: ((updatedOrders: GameConfig['orders']) => void) | null;
}


export default function OrderList({ config, handleEditOrders = null }: OrderListProps) {

	function RenameOrder(newName: string, oldName: string) {
		if (handleEditOrders) {
			const result = renameProperty(config.orders, newName, oldName);
			if (result) {
				handleEditOrders(result);
			}
		}
	}

	const orders = Object.entries(config.orders).map(
		([orderName, order]) => {
			return (
				<li key={orderName}>
					<div>
						<NameFieldComponent name={orderName} editName={handleEditOrders ? (newName) => (RenameOrder(newName, orderName)) : null} />
						<OrderDisplay config={config} order={order!} editOrder={
							handleEditOrders ? (o) => handleEditOrders({ ...config.orders, [orderName]: o }) : null
						} />
					</div>
				</li>
			)
		}
	)
	function AddNewOrder() {
		if (handleEditOrders) {
			let untitledOrders = 0;
			while (config.orders[`new_order_${untitledOrders}`]) {
				untitledOrders += 1;
			}
			const newOrderName = `new_order_${untitledOrders}`;
			let newOrder: RankOrder = { order: [], rank_to_index: {}, };
			const updated = {
				...config.orders,
				[newOrderName]: newOrder,
			}
			handleEditOrders(updated);
		}
	}
	return (
		<div>
			<ul className={styles.elementListing}>
				{orders}
				{handleEditOrders && <button className={styles.menuButton} onClick={AddNewOrder}> Add Order </button>}
			</ul>
		</div>
	)
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
