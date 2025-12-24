import { useQuery } from '@tanstack/react-query';

import { menuApi } from '../api/menu.api';
import { filterMenuByAccess } from './menuAccess';

import type { RawMenuItem } from './menu.types';

export function useMenuQuery(url: string, roles: string[], permissions: string[], isAuthenticated: boolean) {
	return useQuery({
		queryKey: ['menu', url],
		enabled: !!url,
		queryFn: async () => {
			const raw = await menuApi.fetchMenu(url);
			return menuApi.normalize(raw);
		},
		select: (normalized: RawMenuItem[]) => {
			const filtered = filterMenuByAccess(normalized, roles, permissions);
			return isAuthenticated ? filtered : filtered.filter((x) => !x.authRequired);
		},
		staleTime: 5 * 60_000,
	});
}
