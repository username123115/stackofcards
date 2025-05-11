import { useState } from 'react';
import styles from './components.module.css'

function Entrance({ onCreate = null }: { onCreate: (() => void) | null }) {
	const [codeInput, setCodeInput] = useState<string>('');
	const message = Validate(codeInput);

	const handleCreateGameClicked = () => {
		if (onCreate) {
			onCreate();
		}
	}

	return (
		<>

			<div className={styles.entrance}>
				<form className={styles.join}>
					<h1> Join game </h1>
					<input
						value={codeInput}
						type="text"
						onChange={(e) => setCodeInput(e.target.value)}
					/>
					<button className={styles.button}> Join </button>

					<div className={styles.info}>
						{message}
					</div>

				</form>

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

function Validate(n: string): string | null {
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

export default Entrance
