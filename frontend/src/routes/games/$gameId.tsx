import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'

import { connectToGame } from '@client/websocket'
import { ClientState } from "@client/client_state";

import type { GameSnapshot } from '@bindings/GameSnapshot'
import type { PlayerCommand } from '@bindings/PlayerCommand'

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

	const [clientStateClone, setClientStateClone] = useState<ClientState | null>(null);
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
		setClientStateClone(clientState.current);
	}

	function onErrorCallback(error: Event) {
		console.error(`websocket error: ${error}`);
	}

	function onCloseCallback() {
		socket.current = null;
	}

	function handleSendCommand(command: PlayerCommand) {
		if (socket.current) {
			console.log(`Sending PlayerCommand over ws: ${command}`);
			socket.current.send(JSON.stringify(command));
		}
	}


	function initClientState(snapshot: GameSnapshot): String {
		try {
			const cs = ClientState.fromSnapshot(snapshot)
			clientState.current = cs;
		} catch (error) {
			console.log(`Something went wrong initializing a client state: ${error}`)
			return String(error);
		} finally {
			return "Success, joining shortly"
		}
	}

	if (socket.current) {
		if (clientStateClone) {
			return (<Client state={clientStateClone} setCommand={handleSendCommand} />)
		} else {
			return <span> {joinError} </span>
		}
	} else {
		return <span> Couldn't connect to game </span>
	}
}
