import { createFileRoute, redirect, Navigate } from '@tanstack/react-router'
import { useState } from 'react'

import Entrance from '@components/entrance.tsx'
// import { Route as createGameRoute } from './create-game'


export const Route = createFileRoute('/')({
	component: RouteComponent,
})


function RouteComponent() {
	const [pendingCreation, setPendingCreation] = useState<boolean>(false);
	function CreateGame() {
		setPendingCreation(true);
	}
	if (pendingCreation) {
		return <Navigate to="/create-game" />
	}
	return (
		<>
			<Entrance onCreate={CreateGame} />
		</>
	)
}
