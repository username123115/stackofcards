import { createFileRoute, redirect, Navigate } from '@tanstack/react-router'
import { useState } from 'react'

import Entrance from '@components/entrance.tsx'


export const Route = createFileRoute('/')({
	component: RouteComponent,
})



function RouteComponent() {
	const [pendingCode, setPendingCode] = useState<Number | null>(null);
	const [pendingCreation, setPendingCreation] = useState<boolean>(false);
	const handleTriggerCreate = () => setPendingCreation(true);
	const handleSubmitCode = (code: Number) => setPendingCode(code);

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
