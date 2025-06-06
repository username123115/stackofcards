import { createFileRoute, useParams } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'

import { connectToGame } from '@client/websocket'
import type { GameSnapshot } from '@bindings/GameSnapshot'
import type { GameAction } from "@bindings/GameAction";

import Client from '@components/client'

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

	// Sets playerId OR returns a reason why it couldn't be found
	function findIdFromPrivate(private_actions: GameAction[]) {
		let info_msg: String = "Couldn't get ID";
		private_actions.forEach(
			(action) => {
				if (typeof action !== 'string' && 'JoinResult' in action) {
					const joinResult = action.JoinResult;
					if ('Ok' in joinResult) {
						info_msg = "Found player ID, rerendering shortly";
						setPlayerId(joinResult.Ok);
					} else {
						info_msg = `Error while joining: ${joinResult.Err}`;
					}
				}

			}
		)
		return <div> {info_msg} </div>
	}

	function renderSnapshot(snapshot: GameSnapshot) {
		if (playerId) {
			return (<Client snapshot={snapshot} playerId={playerId} />)
		} else {
			if (snapshot.private_actions) {
				return findIdFromPrivate(snapshot.private_actions);
			}
			return <div> Couldn't join room, reason unknown </div>
		}

	}

	if (socket.current) {
		if (snapshot) {
			return renderSnapshot(snapshot);
		} else {
			return <div> Waiting on game to send data </div>
		}
	} else {
		return <div> Couldn't connect to game </div>
	}
}
