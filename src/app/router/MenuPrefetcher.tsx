import { useEffect } from 'react';

import { router } from './index.tsx';

import type { RawMenuItem } from '../../navigation/menu.types.ts';

interface Props {
	menuItems?: RawMenuItem[] | null;
}

/**
 * Prefetch routes marked with `prefetch: true` in menu.json
 */
export default function MenuPrefetcher({ menuItems }: Props) {
	useEffect(() => {
		if (!menuItems || menuItems.length === 0) return;

		const walk = (items: RawMenuItem[]) => {
			for (const item of items) {
				if (item.prefetch && item.path) {
					router.preloadRoute({ to: item.path });
				}
				if (item.children) {
					walk(item.children);
				}
			}
		};

		walk(menuItems);
	}, [menuItems]);

	return null;
}
