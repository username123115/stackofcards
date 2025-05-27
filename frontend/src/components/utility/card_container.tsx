import styles from './card.module.css'
import type { Rank, Suit, Card, Zone } from '@client/zones'


function CardContainer() {
	// Pass down to card, have enums to control style of children
	let examples: Zone = {
		contents: [
			{ rank: "Ace", suit: "Hearts" },
			{ rank: "Four", suit: "Hearts" },
			{ rank: "King", suit: "Clubs" }
		]

	}

	//TODO: This needs to change the absolute position of children and rotate them a little too
	const listItems = examples.contents.map((card, index) =>
		<li key={index.toString()}>
			<div>
				<CardDisplay card={card} />
			</div>
		</li>
	);

	return (
		<>
			<ul className={styles.cardContainer}>
				{listItems}
			</ul>
		</>
	)
}

function CardDisplay({ card }: { card: Card }) {
	return (
		<>
			<div className={styles.card}>
				<div className={styles.rank}> {card.rank} </div>
				<div className={styles.suit}> {card.suit} </div>
			</div>
		</>
	)

}

export default CardContainer
