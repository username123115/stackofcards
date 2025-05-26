import { createFileRoute } from '@tanstack/react-router'
import CreateGame from '@components/create_game'

export const Route = createFileRoute('/create-game')({
	component: RouteComponent,
})

type RulesetDescriber = { name: string, description: string, identifier: bigint, };

function RouteComponent() {
	/* async function fetchGameList(): Promise<Array<RulesetDescriber>> {
		try {
			const response = await axios.get<Array<TestObj>
		}

	} */
	return (
		<>
			<CreateGame />

		</>
	)
}
