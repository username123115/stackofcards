import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
	plugins: [TanStackRouterVite({ target: 'react', autoCodeSplitting: true }), react()],
	server: {
		proxy: {
			'/v1': {
				target: 'http://localhost:5050',
				changeOrigin: true,
			}
		}
	},
	resolve: {
		alias: {
			'@components': path.resolve(__dirname, './src/components'),
		},

	},
})
