import * as React from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { UserContext } from '@client/userContext'
import { useState } from 'react';
import type { UserInfo } from '@bindings/UserInfo'

export const Route = createRootRoute({
	component: RootComponent,
})

function RootComponent() {
	const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
	return (
		<UserContext value={[currentUser, setCurrentUser]}>
			<React.Fragment>
				<Outlet />
			</React.Fragment>
		</UserContext>
	)
}
