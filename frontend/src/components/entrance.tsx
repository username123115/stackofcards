import styles from './components.module.css'

function Entrance() {
	return (
		<>

			<div className={styles.entrance}>
				<div className={styles.join}>
					<h1> Join game </h1>
					<input value="Enter Code" />
					<button className={styles.button}> Join </button>
				</div>

				<div className={styles.create}>
					<button className={styles.button}> Create Game </button>

				</div>

			</div>
		</>
	)
}

export default Entrance
