import { createFileRoute } from '@tanstack/react-router'

import Header from '@components/header.tsx'
import Footer from '@components/footer.tsx'
import styles from '@styles/utility.module.css'

export const Route = createFileRoute('/about')({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<>
			<div className={styles.pageWrapper}>
				<Header />
				<div className={styles.centerDiv}>
					<p>
						Stack of Cards is a work in progress web app for designing and playing card games <br />
						It uses a custom language specifically for this purpose, but this language is not fully implemented yet
					</p>
				</div>
				<Footer />
			</div>

		</>
	)
}
