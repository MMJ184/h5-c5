// src/components/RoutesFromMenu.tsx
import React, { useMemo } from 'react';

import { useRoutes } from 'react-router-dom';

import AuthGuard from '../routes/AuthGuard';
import type { RawMenuItem } from '../services/MenuServiceTypes';

/**
 * RoutesFromMenu
 * - Accepts menuItems (already filtered by useMenu)
 * - Creates route objects; wraps each element in AuthGuard (passing the menu item)
 *
 * Notes:
 * - Assumes pages live under src/pages and default-exported components.
 * - Uses import.meta.glob for Vite-friendly lazy loading.
 */

type Props = {
  menuItems?: RawMenuItem[] | null;
};

function buildPagesLoaderMap() {
  // relative to this file at build time
  return import.meta.glob('../pages/**/*.tsx') as Record<string, () => Promise<any>>;
}

function findModuleKeyByComponentName(
  modules: Record<string, () => Promise<any>>,
  componentName?: string,
) {
  if (!componentName) return undefined;
  return Object.keys(modules).find(
    (k) => k.endsWith(`/${componentName}.tsx`) || k.endsWith(`/${componentName}.jsx`),
  );
}

export default function RoutesFromMenu({ menuItems }: Props) {
  const pageModules = useMemo(() => buildPagesLoaderMap(), []);

  const makeElement = (componentName?: string | null, item?: RawMenuItem) => {
    if (!componentName) return undefined;
    const key = findModuleKeyByComponentName(pageModules, componentName);
    if (!key) return undefined;
    const loader = pageModules[key];
    const LazyComp = React.lazy(loader);
    const element = (
      <React.Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
        <LazyComp />
      </React.Suspense>
    );

    // Wrap with AuthGuard so even direct URL access is checked
    return <AuthGuard item={item}>{element}</AuthGuard>;
  };

  function walk(items?: RawMenuItem[]) {
    if (!items) return [];
    return items.map((it) => {
      const route: any = {
        path: it.path || (it.key && it.key.startsWith('/') ? it.key : it.key || ''),
        element: makeElement(it.component, it),
      };
      if (it.children && it.children.length) {
        route.children = walk(it.children);
      }
      return route;
    });
  }

  const routeObjects = useMemo(() => walk(menuItems ?? []), [menuItems, pageModules]);
  const element = useRoutes(routeObjects);
  return <>{element}</>;
}
