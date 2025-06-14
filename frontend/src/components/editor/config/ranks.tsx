import type { Rank } from "@bindings/Rank";

export default function AllowedRanksList({ ranks }: { ranks: Rank[] }) {
	const rlist = ranks.map(
		(rank) => {
			return (
				<li key={rank}>
					{rank}
				</li>
			)
		}
	)
	return (
		<div>
			<ul> {rlist} </ul>
		</div>
	)
}
