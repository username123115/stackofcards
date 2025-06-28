import { createFileRoute } from '@tanstack/react-router'

import { useMutation } from '@tanstack/react-query'
import { handleAxiosError } from '@client/utility'

import Header from '@components/header.tsx'
import Footer from '@components/footer.tsx'
import styles from '@styles/utility.module.css'

export const Route = createFileRoute('/rulesets/$rulesetId/start')({
	component: RouteComponent,
})

function RouteComponent() {
	const { rulesetId } = Route.useParams();
	return <div>Hello "/rulesets/$rulesetId/start"!</div>
}

