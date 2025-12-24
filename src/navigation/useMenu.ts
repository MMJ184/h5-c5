import { useMemo } from 'react';

import { useAuth } from '../auth/useAuth';
import { useMenuQuery } from './menu.queries';
import { filterMenuByAccess } from './menuAccess';

import type { RawMenuItem } from './menu.types';

/**
 * Removes items that require authentication
 * Used when user is logged out
 */
function removeAuthRequired(items: RawMenuItem[]): RawMenuItem[] {
	const result: RawMenuItem[] = [];

	for (const item of items) {
		if (item.authRequired) {
			// Promote children instead of dropping entire branch
			if (item.children) {
				result.push(...removeAuthRequired(item.children));
			}
			continue;
		}

		result.push({
			...item,
			children: item.children ? removeAuthRequired(item.children) : undefined,
		});
	}

	return result.length > 0 ? result : [];
}

export function useMenu() {
	const url = '/mock/menu.json';

	const auth = useAuth();

	const roles = auth.roles ?? [];
	const permissions = auth.permissions ?? [];
	const isAuthenticated = auth.isAuthenticated ?? false;

	const query = useMenuQuery(url, roles, permissions, isAuthenticated);

	const rawItems = query.data ?? null;

	const items = useMemo(() => {
		if (!rawItems) return null;

		// Role & permission filtering
		const accessFiltered = filterMenuByAccess(rawItems, roles, permissions);

		// Extra safety for logged-out users
		return isAuthenticated ? accessFiltered : removeAuthRequired(accessFiltered);
	}, [rawItems, isAuthenticated, roles.join('|'), permissions.join('|')]);

	return {
		rawItems,
		items,
		loading: query.isLoading || query.isFetching,
		error: (query.error as Error) ?? null,
		refetch: query.refetch,
	};
}
