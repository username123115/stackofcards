import { createFileRoute } from '@tanstack/react-router'
import CreateGame from '@components/create_game'

export const Route = createFileRoute('/create-game')({
	component: RouteComponent,
})


function RouteComponent() {
	//async function fetchGameList(): 
	return (
		<>
			<CreateGame />

		</>
	)
}
