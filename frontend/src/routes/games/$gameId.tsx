import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'

import { connectToGame } from '@client/websocket'
import type { GameSnapshot } from '@bindings/GameSnapshot'
import type { GameAction } from "@bindings/GameAction";

import { ClientState } from "@client/client_state";

import Client from '@pages/client'

import Header from '@components/header.tsx'
import Footer from '@components/footer.tsx'
import styles from '@styles/utility.module.css'

export const Route = createFileRoute('/games/$gameId')({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<>
			<div className={styles.pageWrapper}>
				<Header />
				<InnerRouteComponent />
				<Footer />
			</div>

		</>
	)
}

function InnerRouteComponent() {


	const { gameId } = Route.useParams();
	const code = Number(gameId);

	const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
	const [playerId, setPlayerId] = useState<String | null>(null);
	const [clientState, setClientState] = useState<ClientState | null>(null);

	const socket = useRef<WebSocket | null>(null);

	function onSnapshot(snapshot: GameSnapshot) {
		console.info(snapshot);
		setSnapshot(snapshot);
	}

	function onErrorCallback(error: Event) {
		console.error(`websocket error: ${error}`);
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

	function initClientState(snapshot: GameSnapshot) {
		let playerId: String | null = null;
		snapshot.actions.forEach(
			(action) => {
				if (typeof action !== 'string' && 'JoinResult' in action) {
					const joinResult = action.JoinResult;
					if ('Ok' in joinResult) {
						playerId = joinResult.Ok;
					} else {
						return (<span> Error while joining: {joinResult.Err} </span>)
					}
				}

			}
		)
		if (!playerId) {
			return (<span> Can't get player ID </span>)
		}
		if (!snapshot.players) {
			return (<span> Couldn't get player list </span>)
		}
		const client = new ClientState(
			snapshot.status,
			snapshot.players,
			snapshot.actions,
			playerId,
		);
		setClientState(client);
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
