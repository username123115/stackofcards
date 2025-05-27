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

	const listItems = examples.contents.map((card, index) =>
		<li key={index.toString()}>
			<CardDisplay card={card} />
		</li>
	);

	return (
		<>
			<ul>
				{listItems}
			</ul>
		</>
	)
}

function CardDisplay({ card }: { card: Card }) {
	return (
		<>
			<div>
				<p> {card.rank} </p>
				<p> {card.suit} </p>
			</div>
		</>
	)

}

export default CardContainer
