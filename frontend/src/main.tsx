import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.module.css'

import App from './App.tsx'
import Header from './components/utility/header.tsx'
import Footer from './components/utility/footer.tsx'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Header />
		<App />
		<Footer />
	</StrictMode>,
)

