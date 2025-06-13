import styles from './client.module.css'
// import type { PlayerCommand } from '@bindings/PlayerCommand'
import type { PlayerCommandCallback } from '@client/utility'
import type { GameChat } from '@bindings/GameChat'

import { ClientState } from "@client/client_state";
import { useState, useRef } from 'react';


export default function Client({ state, setCommand }: { state: ClientState, setCommand: PlayerCommandCallback }) {
	function RequestBegin() {
		setCommand("StartGame");
	}
	function SendMessage(message: String) {
		console.log(message);
		setCommand({
			SendMsg: String(message),
		})

	}
	if (state.isWaiting()) {
		return (
			<div>
				<Waiting state={state} signalStart={RequestBegin} />
				<ChatDisplay state={state} onMessage={SendMessage} />
			</div>)
	}
	return (<span> Todo </span>)
}

function ChatDisplay({ state, onMessage }: { state: ClientState, onMessage: ((message: String) => void) }) {
	const chatHistoryRef = useRef<HTMLUListElement>(null);

	const chats = state.chatLog.map(
		(chat, index) => {
			return (
				<li key={index}>
					<ChatElement state={state} chat={chat} />
				</li>
			)
		}
	)


	const result = (
		<div className={styles.chatDisplay}>
			<ul ref={chatHistoryRef}>
				{chats}
			</ul>
			<ChatInput onMessage={onMessage} />
		</div>
	)

	if (chatHistoryRef.current) {
		chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
	}

	return result;
}

function ChatInput({ onMessage }: { onMessage: ((message: String) => void) }) {
	const [inputText, setInputText] = useState('');

	const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter' && inputText.trim() !== '') {
			onMessage(inputText);
			setInputText('');
		}
	}
	return (
		<input type="text"
			onChange={(e) => setInputText(e.target.value)}
			onKeyDown={handleInputKeyDown}
			value={inputText}
		/>)
}

function ChatElement({ state, chat }: { state: ClientState, chat: GameChat }) {

	let sender = "~";
	if (chat.from) {
		const pid = chat.from;
		if (pid === state.playerId) {
			sender = ">";
		} else {
			let nick = state.players.players[pid]?.nickname;
			if (nick) {
				sender = "@" + nick;
			} else {
				sender = `(${pid})`;
			}
		}
	}
	return (
		<div className={styles.chatElement}>
			<div className={styles.chatElementFrom}>
				{sender}
			</div>
			<div className={styles.chatElementMsg}>
				{chat.contents}
			</div>
		</div>
	)
}

function Waiting({ state, signalStart }: { state: ClientState, signalStart: (() => void) }) {
	return (
		<>
			<div>
				<div className={styles.statusBar}>
					{state.isReady() ? "Waiting for host to start game" : "Waiting for players"}
				</div>
				<div className={styles.container}>
					<div className={styles.title}> Players </div>
					<Roster state={state} />
					{state.isFirst() && (<StartButton />)}
				</div>
			</div>
		</>
	)

	function StartButton() {
		return (
			<button disabled={!state.isReady()} onClick={signalStart}>
				{state.isReady() ? "Start Game" : "Waiting for players"}
			</button>
		);
	}

}


function Roster({ state }: { state: ClientState }) {
	if (state.isWaiting()) {
		const roster = state.players.order.map((pid) => {
			const isPlayer = pid === state.playerId;
			const key = isPlayer + pid;
			const nick = state.players.players[pid]?.nickname;

			let role = state.players.players[pid]?.role?.role;
			if (role) {
				role = "(" + role + ")";
			}
			const display = (nick ? nick : "") + (role ? role : "");
			// This is really gross, lgtm
			return (
				<li key={key + display} className={isPlayer ? styles.rosterSelf : styles.rosterOther}>
					<span> {display} </span>
				</li>
			)
		})
		return (
			<div className={styles.roster}>
				<ul>
					{roster}
				</ul>
			</div>
		)
	}
}
