import { createFileRoute } from '@tanstack/react-router'

import Header from '@components/header.tsx'
import Footer from '@components/footer.tsx'
import styles from '@styles/utility.module.css'

import { SignUp } from '@components/auth'

import type { NewUser } from '@bindings/NewUser';

export const Route = createFileRoute('/signup')({
	component: RouteComponent,
})

function handleSignUp(user: NewUser) {
	console.log(user);
}

function RouteComponent() {
	return (
		<div className={styles.pageWrapper}>
			<Header />
			<div className={styles.centerDiv}>
				<SignUp signup={handleSignUp} />
			</div>
			<Footer />
		</div>
	)
}
