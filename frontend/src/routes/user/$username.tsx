import axios from 'axios';
import { useQuery } from '@tanstack/react-query'

import { createFileRoute } from '@tanstack/react-router'
import { handleAxiosError } from '@client/utility'

import Header from '@components/header.tsx'
import Footer from '@components/footer.tsx'
import styles from '@styles/utility.module.css'

import type { UserInfo } from '@client/types/schema/user'

export const Route = createFileRoute('/user/$username')({
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

async function getPlayer(username: Username): Promise<UserInfo> {
	try {
		const response = await axios.get<UserInfo>(`/v1/users/by-name/${username}`);
		return response.data;
	} catch (error) {
		handleAxiosError(error, "Couldn't get user");
	}
}

function InnerRouteComponent() {
	const { username } = Route.useParams();
	const userQuery = useQuery({ queryKey: [username], queryFn: () => getPlayer(username) })
	if (userQuery.isPending) {
		return <span> Fetching user info... </span>
	}
	if (userQuery.isError) {
		return <span> Error: {userQuery.error.message} </span>
	}

	return (
		<div>
			<div> {username} </div>
		</div>)
}
