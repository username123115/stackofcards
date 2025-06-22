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

				<ul>
					<li> <a href="/"> Play </a> </li>
					<li> <a href="/login"> Login </a> </li>
				</ul>
			</ul>
		</header>
	)
}

export default Header
