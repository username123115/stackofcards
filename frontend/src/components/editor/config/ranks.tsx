import type { Rank } from "@client/types/engine/core";
import styles from "./config.module.css";

const ALL_RANKS: Rank[] = [
	"Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
	"Nine", "Ten", "Jack", "Queen", "King", "Ace"
];

interface AllowedRanksListProps {
	ranks: Rank[];
	handleEditRanks: ((updatedRanks: Rank[]) => void) | null;
}

export default function AllowedRanksList({ ranks, handleEditRanks = null }: AllowedRanksListProps) {
	const handleCheckboxChange = (rank: Rank) => {
		if (!handleEditRanks) return;

		let updatedRanks: Rank[];
		if (ranks.includes(rank)) {
			updatedRanks = ranks.filter((r) => r !== rank);
		} else {
			updatedRanks = [...ranks, rank];
		}

		updatedRanks.sort((a, b) => ALL_RANKS.indexOf(a) - ALL_RANKS.indexOf(b));
		handleEditRanks(updatedRanks);
	};

	return (
		<div className={styles.elementListing}>
			<ul className={styles.horizontalList} >
				{
					ALL_RANKS.map((rank) => (
						<li key={rank}>
							<div className={styles.listItem}>
								<label>
									<input
										type="checkbox"
										checked={ranks.includes(rank)}
										disabled={!handleEditRanks}
										onChange={() => handleCheckboxChange(rank)}
									/>
									{rank}
								</label>
							</div>
						</li>
					))
				}
			</ul>
		</div >
	);
}

