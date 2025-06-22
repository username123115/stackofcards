import type { NewUser } from '@bindings/NewUser';
import type { LoginUser } from '@bindings/LoginUser';

import { useState } from 'react';
import styles from './auth.module.css';

function removeNonAlphanumeric(str: string): string {
	return str.replace(/[^a-zA-Z0-9]/g, '');
}

export function SignIn({ login }: { login: ((user: LoginUser) => void) }) {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	return (
		<div className={styles.inputContainer} >
			<div>
				<div> Username </div>
				<input value={username} type="text" onChange={(e) => setUsername(removeNonAlphanumeric(e.target.value))}>
				</input>
			</div>
			<div>
				<div> Password </div>
				<input value={password} type="password" onChange={(e) => setPassword(e.target.value)}>
				</input>
			</div>
			<button> Submit </button>
			<a href="/signup"> Not a user yet? Sign up </a>
		</div >
	)
}

export function SignUp({ signup }: { signup: ((user: NewUser) => void) }) {
	const [username, setUsername] = useState("");
	const [password1, setPassword1] = useState("");
	const [password2, setPassword2] = useState("");

	return (<div className={styles.inputContainer} >
		<div>
			<div> Username </div>
			<input value={username} type="text" onChange={(e) => setUsername(removeNonAlphanumeric(e.target.value))}>
			</input>
		</div>
		<div>
			<div> Password </div>
			<input value={password1} type="password" onChange={(e) => setPassword1(e.target.value)}>
			</input>
		</div>
		<div>
			<div> Confirm Password </div>
			<input value={password2} type="password" onChange={(e) => setPassword2(e.target.value)}>
			</input>
		</div>
		<button> Submit </button>

		<a href="/login"> Already a user? Log in </a>
	</div>
	)
}

