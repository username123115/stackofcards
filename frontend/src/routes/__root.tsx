import * as React from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { UserContext } from '@client/userContext'
import { useState } from 'react';
import type { UserInfo } from '@bindings/UserInfo'

export const Route = createRootRoute({
	component: RootComponent,
})

function RootComponent() {
	//TODO: this doesn't seem like a smart way to fetch users
	const storedUserValue = sessionStorage.getItem("socs_user");
	const currentUser = storedUserValue ? JSON.parse(storedUserValue) : null;

	const [userState, setUserState] = useState(currentUser);

	function setCurrentUser(user: UserInfo) {
		sessionStorage.setItem("socs_user", JSON.stringify(user));
		setUserState(user);
	}

	return (
		<UserContext value={[userState, setCurrentUser]}>
			<React.Fragment>
				<Outlet />
			</React.Fragment>
		</UserContext>
	)
}
