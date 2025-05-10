import styles from './utility.module.css'

function Header({ title = "Stack of Cards" }) {
	return (
		<header className={styles.header}>
			<h1>
				{title}
			</h1>
		</header>
	)
}

export default Header
