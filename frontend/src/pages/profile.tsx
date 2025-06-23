import { UserContext } from '@client/userContext'
import { useContext } from 'react'

import utilityStyles from '@styles/utility.module.css'
import styles from './profile.module.css'

export default function Profile() {
	const [user, _] = useContext(UserContext);
	if (!user) {
		return <span> Not logged in </span>
	}
	return (
		<div className={utilityStyles.centerHor}>
			<h1> {user.username}'s Profile </h1>

			<h1> Games </h1>
			<div className={styles.games} >
			</div>
		</div>
	)
}
