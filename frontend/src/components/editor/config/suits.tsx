import type { Suit } from "@bindings/Suit";
import styles from "./config.module.css";

const ALL_SUITS: Suit[] = ["Hearts", "Diamonds", "Clubs", "Spades"];

interface AllowedSuitsListProps {
	suits: Suit[];
	handleEditSuits: ((updatedSuits: Suit[]) => void) | null;
}

export default function AllowedSuitsList({ suits, handleEditSuits = null }: AllowedSuitsListProps) {
	const handleCheckboxChange = (suit: Suit) => {
		if (!handleEditSuits) return;

		let updatedSuits: Suit[];
		if (suits.includes(suit)) {
			updatedSuits = suits.filter((s) => s !== suit);
		} else {
			updatedSuits = [...suits, suit];
		}

		updatedSuits.sort((a, b) => ALL_SUITS.indexOf(a) - ALL_SUITS.indexOf(b));
		handleEditSuits(updatedSuits);
	};

	return (
		<div className={styles.elementListing}>
			<ul className={styles.horizontalList} >
				{ALL_SUITS.map((suit) => (
					<li key={suit} className={styles.zoneRule}>
						<div className={styles.listItem}>
							<label>
								<input
									type="checkbox"
									checked={suits.includes(suit)}
									disabled={!handleEditSuits}
									onChange={() => handleCheckboxChange(suit)}
								/>
								{suit}
							</label>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}

