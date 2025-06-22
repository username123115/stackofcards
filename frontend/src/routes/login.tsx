import { createFileRoute } from '@tanstack/react-router'

import Header from '@components/header.tsx'
import Footer from '@components/footer.tsx'
import styles from '@styles/utility.module.css'

import { SignIn } from '@components/auth'

import type { LoginUser } from '@bindings/LoginUser';

export const Route = createFileRoute('/login')({
	component: RouteComponent,
})

function handleLogin(user: LoginUser) {
	console.log(user);
}

function RouteComponent() {
	return (
		<div className={styles.pageWrapper}>
			<Header />
			<div className={styles.centerDiv}>
				<SignIn login={handleLogin} />
			</div>
			<Footer />
		</div>
	)
}
