import type { RawMenuItem } from './menu.types.ts';

export function findItemByKey(items: RawMenuItem[] | null | undefined, key: string) {
	if (!items) return null;
	for (const it of items) {
		if (String(it.key) === key) return it;
		if (it.children) {
			const found = findItemByKey(it.children, key);
			if (found) return found;
		}
	}
	return null;
}

export function findKeyByPath(items: RawMenuItem[] | null | undefined, pathname: string) {
	if (!items) return undefined;
	for (const it of items) {
		if (it.path && normalizePath(it.path) === normalizePath(pathname)) return it.key;
		if (it.children) {
			const found = findKeyByPath(it.children, pathname);
			if (found) return found;
		}
	}
	return undefined;
}

function normalizePath(p: string) {
	// simple normalization: ensure no trailing slash (except root)
	return p === '/' ? p : p.replace(/\/+$/, '');
}
