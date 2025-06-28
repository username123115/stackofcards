import { createFileRoute, Navigate } from '@tanstack/react-router'

import { UserContext } from '@client/userContext'
import { useContext } from 'react';

import Header from '@components/header.tsx'
import Footer from '@components/footer.tsx'
import styles from '@styles/utility.module.css'

export const Route = createFileRoute('/profile')({
	component: RouteComponent,
})

function RouteComponent() {
	const [currentUser, _] = useContext(UserContext);
	if (currentUser) {
		return <Navigate to="/user/$username" params={{ username: currentUser.username }} />
	}
	return (
		<div className={styles.pageWrapper}>
			<Header />
			<div> Not logged in </div>
			<Footer />
		</div>
	)
}

