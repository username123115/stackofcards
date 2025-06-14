import type { Suit } from "@bindings/Suit";
export default function AllowedSuitsList({ suits }: { suits: Suit[] }) {
	const slist = suits.map(
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
			<ul> {slist} </ul>
		</div>
	)
}
