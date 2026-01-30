import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: [
			{
				find: /^react-dom$/,
				replacement: fileURLToPath(new URL('./src/shims/react-dom-compat.ts', import.meta.url)),
			},
		],
	},
	server: {
		port: 5173,
	},
});
