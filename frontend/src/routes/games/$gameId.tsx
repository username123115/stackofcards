import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'

import { connectToGame } from '@client/websocket'
import type { GameSnapshot } from '@bindings/GameSnapshot'

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

	const [clientStateClone, setClientState] = useState<ClientState | null>(null);
	const [joinError, setJoinError] = useState<String>("Attempting to join");
	const socket = useRef<WebSocket | null>(null);
	const clientState = useRef<ClientState | null>(null);

	//TODO: Socket won't clean up unless 
	useEffect(() => {
		if (!socket.current) {
			socket.current = connectToGame(code, onSnapshot, onErrorCallback, onCloseCallback);
		}

		return () => {
		}

	}, [code]);

	function onSnapshot(newSnapshot: GameSnapshot) {
		console.info(newSnapshot);
		if (clientState.current) {
			let ns = clientState.current.update(newSnapshot);
			clientState.current = ns;
		} else {
			const err = initClientState(newSnapshot);
			if (!clientState.current) {
				setJoinError(err);
			}
		}
		setClientState(clientState.current);
		console.log(clientState.current);
	}

	function onErrorCallback(error: Event) {
		console.error(`websocket error: ${error}`);
	}

	function onCloseCallback() {
		socket.current = null;
	}


	function initClientState(snapshot: GameSnapshot): String {
		let playerId: String | null = null;
		snapshot.private_actions.forEach(
			(action) => {
				if (typeof action !== 'string' && 'JoinResult' in action) {
					const joinResult = action.JoinResult;
					if ('Ok' in joinResult) {
						playerId = joinResult.Ok;
					} else {
						return `Error while joining: {joinResult.Err}`
					}
				}

			}
		)
		if (!playerId) {
			return "Can't get player ID"
		}
		if (!snapshot.players) {
			return "Couldn't get player list"
		}
		const client = new ClientState(
			snapshot.status,
			snapshot.players,
			snapshot.actions,
			snapshot.private_actions,
			playerId,
		);
		clientState.current = client;
		return "Success, joining shortly"
	}

	if (socket.current) {
		if (clientStateClone) {
			return (<Client state={clientStateClone} />)
		} else {
			return <span> {joinError} </span>
		}
	} else {
		return <span> Couldn't connect to game </span>
	}
}
