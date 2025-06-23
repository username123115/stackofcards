import axios from 'axios'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { handleAxiosError } from '@client/utility'

import Header from '@components/header.tsx'
import Footer from '@components/footer.tsx'
import styles from '@styles/utility.module.css'

import { SignIn } from '@components/auth'

import type { LoginUser } from '@bindings/LoginUser';
import type { UserInfo } from '@bindings/UserInfo'
import type { UserBody } from '@bindings/UserBody'

import { useContext } from 'react'
import { UserContext } from '@client/userContext'

export const Route = createFileRoute('/login')({
	component: RouteComponent,
})



async function loginAsUser(user: LoginUser): Promise<UserInfo> {
	let req: UserBody<LoginUser> = { user: user };
	try {
		const response = await axios.post<UserBody<UserInfo>>('/v1/login', req);
		return response.data.user;
	} catch (error) {
		handleAxiosError(error, "Failed to log in a user");
	}
}

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
	const loginMutation = useMutation<UserInfo, Error, LoginUser>({ mutationFn: loginAsUser });

	const [_, setUser] = useContext(UserContext);

	if (!loginMutation.isIdle) {
		if (loginMutation.isPending) {
			return <span> Logging in... </span>
		} if (loginMutation.isError) {
			return <span> Error logging in : {loginMutation.error.message} </span>
		} if (loginMutation.isSuccess) {
			console.log(loginMutation.data);
			if (setUser) {
				setUser(loginMutation.data);
			}
			return <Navigate to="/profile" />
		}
	}

	function handleLogin(user: LoginUser) {
		if (loginMutation.isIdle) {
			loginMutation.mutate(user);
			console.log(user);
		}
	}
	return (
		<div className={styles.centerDiv}>
			<SignIn login={handleLogin} />
		</div>
	)
}
