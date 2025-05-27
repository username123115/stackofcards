import { createFileRoute } from '@tanstack/react-router'
import CardContainer from '@components/utility/card_container'

export const Route = createFileRoute('/cards')({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<>
			<CardContainer />
		</>
	)
}
