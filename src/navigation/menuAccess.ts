// src/utils/menuAccess.ts

import type { RawMenuItem } from './menu.types.ts';

/**
 * Determine if a menu item is allowed for the user by roles / permissions.
 * - If item.roles exists: at least one role must match.
 * - If item.permissions exists: every permission in the item must be present on the user.
 *
 * Special case: if userPermissions includes '*' treat it as super-permission (bypass permission checks).
 */
export function isItemAllowed(item: RawMenuItem, userRoles: string[], userPermissions: string[]) {
	// roles check (if roles defined)
	if (item.roles && item.roles.length > 0) {
		const hasRole = item.roles.some((r) => userRoles.includes(r));
		if (!hasRole) return false;
	}

	// permissions check (if permissions defined)
	if (item.permissions && item.permissions.length > 0) {
		// wildcard '*' in user permissions -> has all permissions
		if (userPermissions.includes('*')) {
			return true;
		}

		const hasAllPermissions = item.permissions.every((p) => userPermissions.includes(p));
		if (!hasAllPermissions) return false;
	}

	return true;
}

/**
 * Filter the menu tree by user access.
 * - Keep an item if: item itself allowed OR any child allowed.
 * - Returns a new array (does not mutate original).
 */
export function filterMenuByAccess(menu: RawMenuItem[], userRoles: string[], userPermissions: string[]) {
	function walk(items?: RawMenuItem[]): RawMenuItem[] {
		if (!items || items.length === 0) return [];
		const out: RawMenuItem[] = [];

		for (const it of items) {
			const children = it.children ? walk(it.children) : undefined;
			const allowed = isItemAllowed(it, userRoles, userPermissions);
			const childAllowed = Array.isArray(children) && children.length > 0;

			if (!allowed && !childAllowed) {
				// skip this item entirely
				continue;
			}

			out.push({
				...it,
				// only attach children that passed access filter
				children: children && children.length > 0 ? children : undefined,
			});
		}

		return out;
	}

	return walk(menu);
}
