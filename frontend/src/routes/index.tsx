import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useState } from 'react'

import Entrance from '@components/entrance.tsx'
import '../styles/app.css'


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
		return <Navigate to="/create-game" />
	}
	return (
		<>
			<Entrance
				triggerCreate={handleTriggerCreate}
				submitCode={handleSubmitCode}

			/>
		</>
	)
}
