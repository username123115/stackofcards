import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import './styles/app.module.css'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

const router = createRouter({ routeTree })

// TODO: I have no idea what this does 🥀
declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router
	}
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>,
)
