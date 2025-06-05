import { createFileRoute, useParams } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'

import { connectToGame } from '@client/websocket'
import type { GameSnapshot } from '@bindings/GameSnapshot'

export const Route = createFileRoute('/games/$gameId')({
	component: RouteComponent,
})

function RouteComponent() {


	const { gameId } = Route.useParams();
	const code = Number(gameId);

	const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
	const [playerId, setPlayerId] = useState<String | null>(null);

	const socket = useRef<WebSocket | null>(null);

	function onSnapshot(snapshot: GameSnapshot) {
		console.info(snapshot);
		setSnapshot(snapshot);
	}

	function onErrorCallback(error: Event) {
	}

	function onCloseCallback() {
		socket.current = null;
	}

	//TODO: Socket won't clean up unless 
	useEffect(() => {
		if (!socket.current) {
			socket.current = connectToGame(code, onSnapshot, onErrorCallback, onCloseCallback);
		}

		return () => {
		}

	}, [code]);

	if (socket.current) {
		if (snapshot) {
			return <div> Connected </div>
		} else {
			return <div> Waiting on game status </div>
		}
	} else {
		return <div> Couldn't connect to game </div>
	}
}
