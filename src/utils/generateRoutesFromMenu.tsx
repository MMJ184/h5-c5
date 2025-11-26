// src/utils/generateRoutesFromMenu.tsx
import React from 'react';
import type { RouteObject } from 'react-router-dom';
import type { RawMenuItem } from '../services/MenuServiceTypes'; // do not include .ts in import

// Vite dynamic import map for pages (matches .tsx and .jsx page files)
const pageModules = import.meta.glob('../pages/**/*.{tsx,jsx}');

/**
 * Resolve a lazy loader for a component name (ComponentName -> file path)
 * Accepts:
 *  - src/pages/.../ComponentName.tsx
 *  - src/pages/.../ComponentName.jsx
 *  - src/pages/.../ComponentName/index.tsx
 *  - src/pages/.../ComponentName/index.jsx
 */
function resolveLoader(componentName: string) {
  const endings = [
    `/${componentName}.tsx`,
    `/${componentName}.jsx`,
    `/${componentName}/index.tsx`,
    `/${componentName}/index.jsx`,
  ];

  const matchKey = Object.keys(pageModules).find((p) => endings.some((e) => p.endsWith(e)));

  if (!matchKey) {
    // helpful warning for developer
    // eslint-disable-next-line no-console
    console.warn(
      `[generateRoutesFromMenu] component "${componentName}" not found in src/pages. ` +
      'Make sure file exists (ComponentName.tsx or ComponentName/index.tsx) and `component` in menu JSON matches file name.',
    );
    return null;
  }

  // return loader function for React.lazy
  return () => (pageModules[matchKey]() as Promise<{ default: React.ComponentType<any> }>);
}

export type RouteMeta = {
  authRequired?: boolean;
  permissions?: string[];
  roles?: string[]; // optional - included for convenience
  title?: string;
  [k: string]: any;
};

export type GeneratedRoute = {
  path: string;
  element: React.LazyExoticComponent<React.ComponentType<any>> | null;
  props?: Record<string, any>;
  children?: GeneratedRoute[];
  meta?: RouteMeta;
};

/**
 * Convert menu JSON (RawMenuItem[]) into GeneratedRoute[] (lazy components)
 */
export function generateRoutesFromMenu(menuItems: RawMenuItem[]): GeneratedRoute[] {
  const walk = (items: RawMenuItem[]): GeneratedRoute[] =>
    items.map((it) => {
      const loader = it.component ? resolveLoader(it.component) : null;
      const element = loader ? React.lazy(loader) : null;

      const route: GeneratedRoute = {
        path: it.path || it.key || '',
        element,
        props: (it as any).props || undefined,
        meta: {
          authRequired: !!it.authRequired,
          permissions: it.permissions || [],
          roles: it.roles || [],
          title: (it.meta && (it.meta.title as string)) || it.label || undefined,
          ...(it.meta || {}),
        },
      };

      if (it.children && it.children.length) {
        route.children = walk(it.children);
      }

      return route;
    });

  return walk(menuItems);
}

/**
 * toReactRouterRoutes
 *
 * Convert GeneratedRoute[] -> react-router RouteObject[]
 *
 * AuthGuardComponent (optional) should be a React component with signature:
 *   const AuthGuard: React.FC<{ item?: RawMenuItem, children: React.ReactElement }>
 *
 * This function will construct a minimal `item` object from the route.meta and pass it to AuthGuard.
 *
 * If you prefer to pass the original RawMenuItem into AuthGuard, change the call site to keep menu metadata.
 */
export function toReactRouterRoutes(
  generated: GeneratedRoute[],
  AuthGuardComponent?: React.ComponentType<{ item?: Partial<RawMenuItem>; children: React.ReactElement }>,
): RouteObject[] {
  const wrapElement = (
    el: React.LazyExoticComponent<React.ComponentType<any>> | null,
    props?: Record<string, any>,
    meta?: RouteMeta,
  ) => {
    if (!el) return undefined;

    // The actual lazy node (suspense + lazy component)
    const node = (
      <React.Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        {React.createElement(el, props ?? {})}
      </React.Suspense>
    );

    if (!AuthGuardComponent) {
      return node;
    }

    // Build a minimal RawMenuItem-like object that works with your AuthGuard logic.
    // AuthGuard expects fields like: authRequired, roles, permissions.
    const guardItem: Partial<RawMenuItem> = {
      authRequired: !!meta?.authRequired,
      roles: (meta?.roles as string[]) || [],
      permissions: (meta?.permissions as string[]) || [],
      // include title/path for debugging if needed
      label: meta?.title ?? undefined,
      path: undefined,
    };

    // Wrap in provided AuthGuardComponent so existing authorization logic runs
    return React.createElement(AuthGuardComponent, { item: guardItem }, node);
  };

  const convert = (arr: GeneratedRoute[]): RouteObject[] =>
    arr.map((r) => ({
      path: r.path,
      element: wrapElement(r.element, r.props, r.meta),
      children: r.children ? convert(r.children) : undefined,
    }));

  return convert(generated);
}
