import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { setupSocsBlockly } from '@Blockly/index'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

const queryClient = new QueryClient()

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router
	}
}

setupSocsBlockly();


createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	</StrictMode>,
)
