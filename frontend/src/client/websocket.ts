import type { GameSnapshot } from './types/wss'

export function connectToGame(
	roomId: number,
	onSnapshot: (snapshot: GameSnapshot) => void,
	onErrorCallback: (error: Event) => void,
	onCloseCallback: () => void
): WebSocket {
	// TODO: Have server pass back an upgrade url when GETing /v1/rooms/{roomId}
	const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
	const host = window.location.host;
	const wsUrl = `${protocol}//${host}/v1/rooms/${roomId}`;

	console.log(`Connecting to ${wsUrl}`);

	let socket = new WebSocket(wsUrl);
	socket.onopen = () => {
		console.log(`Successfully connected to WebSocket room ${roomId}`);
		// Backend will handle a Join/Rejoin, now the client should make sure to receive a private message containing their ID
	}

	socket.onmessage = (event) => {
		try {
			const rawData = JSON.parse(event.data as string);
			const snapshot = rawData as GameSnapshot;

			snapshot ? onSnapshot(snapshot) : console.warn("Received invalid Game Snapshot");
		}
		catch (e) {
			console.error(`Error parsing message from server: ${e} \n Raw: ${event.data}`);
		}
	}

	socket.onerror = (error) => {
		console.error(`WebSocket error: ${error}`);
		onErrorCallback(error);
	}

	socket.onclose = () => {
		console.log(`WebSocket connection to room ${roomId} has closed`);
		onCloseCallback();
	}
	return socket;


}
