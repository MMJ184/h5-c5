import ApiClient from './ApiClient';

import type { RawMenuItem } from '../navigation/menu.types';

function coerceJson(payload: unknown, url: string): unknown {
	if (typeof payload !== 'string') return payload;

	try {
		return JSON.parse(payload);
	} catch {
		throw new Error(`menuApi.fetchMenu: invalid JSON (url: ${url})`);
	}
}

function extractMenuArray(payload: unknown): RawMenuItem[] | null {
	if (Array.isArray(payload)) return payload as RawMenuItem[];

	if (payload && typeof payload === 'object') {
		const obj = payload as any;

		if (Array.isArray(obj.data)) return obj.data as RawMenuItem[];

		const firstArray = Object.values(obj).find((v) => Array.isArray(v));
		if (Array.isArray(firstArray)) return firstArray as RawMenuItem[];
	}

	return null;
}

export async function fetchMenu(url: string): Promise<RawMenuItem[]> {
	// keep text so we can safely handle weird content-types / string JSON
	const res = await ApiClient.get(url, { responseType: 'text' });

	const payload = coerceJson(res.data, url);

	if (import.meta.env.DEV) {
		try {
			console.debug('[menuApi] fetched:', payload);
		} catch {}
	}

	const items = extractMenuArray(payload);
	if (items) return items;

	throw new Error('menuApi.fetchMenu: Unexpected menu payload shape');
}

export function normalizeMenu(items: RawMenuItem[]): RawMenuItem[] {
	return items.map((item) => ({
		key: item.key,
		label: item.label,
		icon: item.icon ?? undefined,
		path: item.path ?? undefined,
		component: item.component ?? undefined,
		prefetch: item.prefetch ?? false,
		authRequired: item.authRequired ?? false,
		permissions: item.permissions ?? [],
		meta: item.meta ?? {},
		roles: item.roles ?? [],
		children: item.children ? normalizeMenu(item.children) : undefined,
	}));
}

export const menuApi = {
	fetchMenu,
	normalize: normalizeMenu,
};
