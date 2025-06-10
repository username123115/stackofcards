import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import axios from 'axios';
import styles from './entrance.module.css'

import type { RoomExistance } from '@bindings/RoomExistance'

// Determines if a string can be parsed into a 6 digit numerical code
function ValidateCodeInput(n: string): string | null {
	if (n.length === 0) {
		return "Enter a code to join";
	}
	const allowed: string = "0123456789";
	for (let i = 0; i < n.length; i++) {
		if (!allowed.includes(n[i])) {
			return "Enter only numeric values";
		}
	}
	if (n.length !== 6) {
		return "Please enter a 6 digit code";
	}
	return null;
}

async function fetchGameExists(code: Number): Promise<Boolean> {
	try {
		const response = await axios.get<RoomExistance>(`v1/games/${code}`);
		return response.data.exists;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			throw new Error(error.response?.data?.message || error.message || "Couldn't fetch room status");
		} else {
			throw new Error("Unexpected error");
		}
	}
}

//Validates and returns a code that points to a game that may or may not still exist
function Join({ submitCode = null }: { submitCode: ((code: Number) => void) | null }) {
	const [codeInput, setCodeInput] = useState<string>('');
	const [pendingCode, setPendingCode] = useState<Number | null>(null);

	const gameExistsQuery = useQuery({
		queryKey: ['GET /v1/games/<index>', pendingCode],
		queryFn: () => fetchGameExists(pendingCode!),
		enabled: pendingCode !== null,
	})

	const parseErrorMessage = ValidateCodeInput(codeInput);
	const handleJoinGameClicked = () => {
		//Check if this is actually a parsable string
		if (!parseErrorMessage) {
			const code = parseInt(codeInput);
			setCodeInput("");
			setPendingCode(code);
		}

	}

	let playerInfoMessage: String | null = "";
	// let enableInput: Boolean = true;

	if (pendingCode) {
		// enableInput = false;
		const status = gameExistsQuery.status;
		if (status === 'pending') {
			playerInfoMessage = "Finding game...";
		} else if (status === 'error') {
			playerInfoMessage = `Error: ${gameExistsQuery.error.message}`;
		} else {
			// enableInput = true;
			const exists = gameExistsQuery.data!;
			playerInfoMessage = `Game exists: ${exists}`;

			if (exists && submitCode) {
				submitCode(pendingCode);
			}
		}
	}

	//Just override this if the player typed something
	if (codeInput) {
		playerInfoMessage = parseErrorMessage;
	}


	return (
		<>
			<div className={styles.join}>
				<h1> Join game </h1>
				<input
					className={styles.input}
					value={codeInput}
					type="text"
					onChange={(e) => setCodeInput(e.target.value)}
				/>
				<button className={styles.button} onClick={handleJoinGameClicked}> Join </button>

				<div className={styles.info}>
					{playerInfoMessage}
				</div>

			</div>

		</>
	)
}

function Entrance({ triggerCreate = null, submitCode = null, }: { triggerCreate: (() => void) | null, submitCode: ((code: Number) => void) | null }) {

	const handleCreateGameClicked = () => {
		if (triggerCreate) {
			triggerCreate();
		}
	}


	return (
		<>

			<div className={styles.entrance}>
				<Join submitCode={submitCode} />

				<div className={styles.or}>
					<h1>
						OR
					</h1>
				</div>

				<div className={styles.create}>
					<button
						className={styles.gameButton}
						onClick={handleCreateGameClicked}> Create Game
					</button>

				</div>

			</div>
		</>
	)
}


export default Entrance
