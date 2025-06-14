import type { GameConfig } from '@bindings/GameConfig'
import type { RankOrder } from "@bindings/RankOrder";

export default function OrderList({ config }: { config: GameConfig }) {
	const orderList = Object.entries(config.orders).map(
		([orderName, order]) => {
			return (
				<li key={orderName}>
					<OrderDisplay order={order!} />
				</li>
			)
		}
	)
	return (
		<div>
			<ul> {orderList} </ul>
		</div>)
}

function OrderDisplay({ order }: { order: RankOrder }) {
	const elements = order.order.map(
		(rank, index) => {
			return (
				<li key={index}> {rank} </li>
			)
		}
	)
	return (
		<div> <ul> {elements} </ul> </div>
	)
}
