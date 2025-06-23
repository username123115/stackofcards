import { createFileRoute } from '@tanstack/react-router'

import Header from '@components/header.tsx'
import Footer from '@components/footer.tsx'
import styles from '@styles/utility.module.css'

export const Route = createFileRoute('/profile')({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div className={styles.pageWrapper}>
			<Header />
			<InnerRouteComponent />
			<Footer />
		</div>
	)
}

function InnerRouteComponent() {
	return (
		<div>
		</div>
	)
}
