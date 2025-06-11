import { createFileRoute } from '@tanstack/react-router'
import CardContainer from '@components/card_container'

// import { useState } from 'react'

// import type { Zone, ZoneId} from '@client/zones'

export const Route = createFileRoute('/cards')({
	component: RouteComponent,
})

function RouteComponent() {
	/* const [selections, setSelections] = useState<Array<CardId>>([]);

	function handleDragStart(event: DragEvent) {
		console.log(`Card is dragged ${event}`);
	}

	let zone1: Zone = {
		contents: [
			{ rank: "Ace", suit: "Hearts", id: "AH0" },
			{ rank: "Four", suit: "Hearts", id: "4H0" },
			{ rank: "King", suit: "Clubs", id: "KC0" }
		],
		displayMode: "Fan",
		id: "z2",
	}

	let zone2: Zone = {
		contents: [
			{ rank: "Four", suit: "Hearts", id: "4H1" },
			{ rank: "Four", suit: "Spades", id: "4S0" },
			{ rank: "Five", suit: "Diamonds", id: "5D0" },
			{ rank: "Six", suit: "Clubs", id: "6C0" },
			{ rank: "King", suit: "Clubs", id: "KC0" }
		],
		displayMode: "Fan",
		id: "z2",
	} */
	return (
		<>
			<CardContainer />
			<CardContainer />
		</>
	)
}
