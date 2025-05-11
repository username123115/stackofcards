import { createFileRoute } from '@tanstack/react-router'
// Funny nvim plugin why do you error here
// I'm actually going to crash out what in the skibidi rizz is this
// It doesn't work in VSCode too chat is this real
// Oh my gyatt I had to have the two referenced tsconfigs extend base
import Entrance from '@components/entrance.tsx'

export const Route = createFileRoute('/')({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<>
			<Entrance />
		</>
	)
}
