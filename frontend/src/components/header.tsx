import styles from './utility.module.css'
import { useContext } from 'react'
import { UserContext } from '@client/userContext'

function Header() {
	const [uinfo, _] = useContext(UserContext);
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
					<li>
						{uinfo ? <a href="/profile"> Profile </a> : <a href="/login"> Login </a>}
					</li>
				</ul>
			</ul>
		</header>
	)
}

export default Header
