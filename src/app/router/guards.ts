import { redirect } from '@tanstack/react-router';

import type { AuthState } from '../../auth/AuthContext';

interface GuardOptions {
	authRequired?: boolean;
	roles?: string[];
	permissions?: string[];
}

export function requireAuth(auth: AuthState, options: GuardOptions = {}) {
	const { authRequired = true, roles = [], permissions = [] } = options;

	// not logged in
	if (authRequired && !auth.isAuthenticated) {
		throw redirect({ to: '/login' });
	}

	// role check
	if (roles.length > 0) {
		const hasRole = roles.some((r) => auth.roles.includes(r));
		if (!hasRole) {
			throw redirect({ to: '/dashboard' });
		}
	}

	// permission check
	if (permissions.length > 0 && !auth.permissions.includes('*')) {
		const hasAll = permissions.every((p) => auth.permissions.includes(p));
		if (!hasAll) {
			throw redirect({ to: '/dashboard' });
		}
	}
}
