import { createRouter } from '@tanstack/react-router';

import { routeTree } from './routes';

import type { AuthState } from '../../auth/AuthContext.tsx';

export const router = createRouter({
	routeTree,
	context: {
		auth: undefined as unknown as AuthState,
	},
});

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}
