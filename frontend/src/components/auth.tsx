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
		<div className={styles.authContainer}>
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
				<a href="/signup"> Not a user yet? Sign up </a>
			</div >
			<div>
				<button onClick={() => login({ username: username, password: password })}> Submit </button>
			</div>
		</div>
	)
}

export function SignUp({ signup }: { signup: ((user: NewUser) => void) }) {
	const [username, setUsername] = useState("");
	const [password1, setPassword1] = useState("");
	const [password2, setPassword2] = useState("");

	const usernameLongEnough = (username.length >= 3);
	const passwordsMatch = (password1 === password2);
	const passwordsLongEnough = (password1.length >= 8);

	const errorMessage = !usernameLongEnough ? "username should be at least three characters" :
		!passwordsMatch ? " passwords don't match" :
			!passwordsLongEnough ? "Password should be at least 8 characters" : null

	return (
		<div className={styles.authContainer}>
			<div className={styles.inputContainer} >
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

				<a href="/login"> Already a user? Log in </a>
			</div>
			<div>
				{errorMessage ?? <button onClick={() => signup({ username: username, password: password1 })}> Sign up </button>}
			</div>
		</div>

	)
}

