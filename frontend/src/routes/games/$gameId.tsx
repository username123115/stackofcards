import { createFileRoute, useParams } from '@tanstack/react-router'
import { connectToGame } from '@client/websocket'

import type { GameSnapshot } from '@bindings/GameSnapshot'

export const Route = createFileRoute('/games/$gameId')({
	component: RouteComponent,
})

function RouteComponent() {

	function onSnapshot(snapshot: GameSnapshot) {
		console.info(snapshot);
	}

	function onErrorCallback(error: Event) {
	}

	function onCloseCallback() {
	}

	const { gameId } = Route.useParams();
	const code = Number(gameId);

	const socket = connectToGame(code, onSnapshot, onErrorCallback, onCloseCallback);

	//TODO: This should be passed as some parameter
	const username: String = "ninebitcomputer";

	return <div>{`Playing game ${code}`}</div>
}
