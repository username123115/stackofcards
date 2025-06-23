import axios from 'axios'
import { createFileRoute, Navigate } from '@tanstack/react-router'

import Header from '@components/header.tsx'
import Footer from '@components/footer.tsx'
import styles from '@styles/utility.module.css'

import { SignUp } from '@components/auth'

import { useContext } from 'react'
import { UserContext } from '@client/userContext'

import { handleAxiosError } from '@client/utility'
import { useMutation } from '@tanstack/react-query'

import type { NewUser } from '@bindings/NewUser'
import type { UserInfo } from '@bindings/UserInfo'
import type { UserBody } from '@bindings/UserBody'

export const Route = createFileRoute('/signup')({
	component: RouteComponent,
})

async function createNewPlayer(user: NewUser): Promise<UserInfo> {
	let req: UserBody<NewUser> = { user: user };
	try {
		const response = await axios.post<UserBody<UserInfo>>('/v1/signup', req);
		return response.data.user;
	} catch (error) {
		handleAxiosError(error, "Failed to sign up for a new user");
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
	const [_, setUser] = useContext(UserContext);
	const signupMutation = useMutation<UserInfo, Error, NewUser>({ mutationFn: createNewPlayer });

	function handleSignUp(user: NewUser) {
		if (signupMutation.isIdle) {
			signupMutation.mutate(user);
			console.log(user);
		}
	}

	if (!signupMutation.isIdle) {
		if (signupMutation.isPending) {
			return <span> Signing up... </span>
		} if (signupMutation.isError) {
			return <span> Error signing up : {signupMutation.error.message} </span>
		} if (signupMutation.isSuccess) {
			console.log(signupMutation.data);
			if (setUser) {
				setUser(signupMutation.data);
			}
			return <Navigate to="/profile" />
		}
	}

	return (
		<div className={styles.centerDiv}>
			<SignUp signup={handleSignUp} />
		</div>
	)
}

