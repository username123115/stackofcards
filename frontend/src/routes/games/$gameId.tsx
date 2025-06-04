import { createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/games/$gameId')({
	component: RouteComponent,
})

function RouteComponent() {
	const { gameId } = Route.useParams();
	const code = Number(gameId);

	//TODO: This should be passed as some parameter
	const username: String = "ninebitcomputer";

	return <div>Hello "/games/$gameid"!</div>
}
