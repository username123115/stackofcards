import styles from './card.module.css'
import type { Card, Zone } from '@client/zones'
import type { DragEvent } from 'react'


function CardContainer() {

	// Pass down to card, have enums to control style of children
	let examples: Zone = {
		contents: [
			{ rank: "Ace", suit: "Hearts", id: "AH0" },
			{ rank: "Four", suit: "Hearts", id: "4H0" },
			{ rank: "King", suit: "Clubs", id: "KC0" }
		],
		displayMode: "Fan",
		id: "Deck",
	}

	const listItems = examples.contents.map((card) => {
		return (
			<li key={card.id.toString()}>
				<div>
					<PlayingCard card={card} />
				</div>
			</li>
		)
	});

	return (
		<>
			<div>
				<ul className={styles.cardContainer}>
					{listItems}
				</ul>
			</div>
		</>
	)
}


function PlayingCard({ card }: { card: Card }) {

	// Keep style changes, call given function
	function handleDragStart(event: DragEvent<HTMLDivElement>) {
		event.currentTarget.classList.add(styles.cardDragging);

		event.dataTransfer.dropEffect = "move";
		event.dataTransfer.setData("text/plain", card.id.toString());
	}

	function handleDragEnd(event: DragEvent<HTMLDivElement>) {
		event.currentTarget.classList.remove(styles.cardDragging);
	}

	function handleDragOver(event: DragEvent<HTMLDivElement>) {
		const otherId = event.dataTransfer.getData("text/plain");

		// Ignore if self
		if (card.id === otherId) {
			return;
		}
		const offX = event.nativeEvent.offsetX;
		const myWidth = event.currentTarget.offsetWidth;
		//Determine which direction to offset this card
		// const dragRatio = offX / myWidth;

		//TODO
		event.currentTarget.classList.add(styles.cardMoveRight);

		console.log(`Move ${otherId} to ${card.id}: ${offX} / ${myWidth}`);
	}

	function handleDragLeave(event: DragEvent<HTMLDivElement>) {
		event.currentTarget.classList.remove(styles.cardMoveRight, styles.cardMoveLeft);
	}



	return (
		<>
			<div className={styles.card} draggable={true} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
				<div className={styles.rank}> {card.rank} </div>
				<div className={styles.suit}> {card.suit} </div>
			</div >
		</>
	)

}

/* function CardDropArea({ card }: { card: Card }) {
	<div>
	</div>
} */

export default CardContainer
