// src/components/Prefetcher.tsx
import { useEffect, useMemo } from 'react';

import type { RawMenuItem } from '../services/MenuServiceTypes.ts';

// import type { RawMenuItem } from "../services/MenuService";

/**
 * Prefetcher
 * - menuItems: menu array
 * - glob path must match the one used in RoutesFromMenu
 *
 * Usage: <Prefetcher menuItems={menuItems} />
 */

export default function Prefetcher({ menuItems }: { menuItems?: RawMenuItem[] | null }) {
  const pageModules = useMemo(
    () => import.meta.glob('../pages/**/*.tsx') as Record<string, () => Promise<any>>,
    [],
  );

  const findModuleKey = (componentName: string | undefined) =>
    Object.keys(pageModules).find(
      (k) =>
        !!componentName &&
        (k.endsWith(`/${componentName}.tsx`) || k.endsWith(`/${componentName}.jsx`)),
    );

  useEffect(() => {
    if (!menuItems) return;
    const toPrefetch = new Set<string>();
    (function walk(items?: RawMenuItem[]) {
      if (!items) return;
      for (const it of items) {
        if (it.prefetch && it.component) toPrefetch.add(it.component);
        if (it.children) walk(it.children);
      }
    })(menuItems);

    for (const compName of Array.from(toPrefetch)) {
      const key = findModuleKey(compName);
      if (key) {
        // trigger import and ignore result
        pageModules[key]().catch(() => {
          /* ignore prefetch failures */
        });
      }
    }
  }, [menuItems, pageModules, findModuleKey]);

  return null;
}
