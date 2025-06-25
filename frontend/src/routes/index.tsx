import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useState } from 'react'

import Entrance from '@pages/entrance.tsx'
import Header from '@components/header.tsx'
import Footer from '@components/footer.tsx'
import '@styles/app.css'
import styles from '../styles/utility.module.css'


export const Route = createFileRoute('/')({
	component: RouteComponent,
})



function RouteComponent() {
	const [pendingCode, setPendingCode] = useState<Number | null>(null);
	const [pendingCreation, setPendingCreation] = useState<boolean>(false);
	const handleTriggerCreate = () => setPendingCreation(true);
	const handleSubmitCode = (code: Number) => setPendingCode(code);

	if (pendingCode) {
		return <Navigate to="/games/$gameId" params={{ gameId: String(pendingCode) }} />
	}

	if (pendingCreation) {
		return <Navigate to="/rulesets" />
	}
	return (
		<>
			<div className={styles.pageWrapper}>
				<Header />
				<div>
					<Entrance
						triggerCreate={handleTriggerCreate}
						submitCode={handleSubmitCode}

					/>
				</div>
				<Footer />
			</div>
		</>
	)
}
