import { createFileRoute, useParams } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

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

	const socket = useRef<WebSocket | null>(null);
	const began = useRef<Boolean>(false);

	useEffect(() => {
		if (!socket.current) {
			socket.current = connectToGame(code, onSnapshot, onErrorCallback, onCloseCallback);
		}

		return () => {
			/* if (socket.current) {
				console.log("disconnecting");
				if (socket.current.readyState === 1) {
					socket.current.close()
					socket.current = null;
				} else {
					socket.current.addEventListener('open', () => {
						socket.current?.close();
						socket.current = null;
					});
				}
			} */
		}

	}, [code]);

	/* if (socket.current) {
		socket.current.send("Arbitrary string to start the game");
	} */


	//TODO: This should be passed as some parameter
	const username: String = "ninebitcomputer";

	return <div>{`Playing game ${code}`}</div>
}
