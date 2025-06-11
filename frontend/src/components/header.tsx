import styles from './utility.module.css'

function Header() {
	return (
		<header className={styles.header}>
			<ul>
				<li> <a href="/about"> About </a> </li>
				<li>
					<a href="/">
						<h1>
							Stack of Cards
						</h1>
					</a>
				</li>
				<li> <a href="/"> Play </a> </li>
			</ul>
		</header>
	)
}

export default Header
