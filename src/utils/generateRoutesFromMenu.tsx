// src/utils/generateRoutesFromMenu.tsx
import React from 'react';

import type { RouteObject } from 'react-router-dom';

import type { RawMenuItem } from '../services/MenuServiceTypes.ts';

// import type { RawMenuItem } from "../services/MenuService";

/**
 * Strategy:
 *  - Use import.meta.glob to gather all page modules in src/pages.
 *  - Map component name => dynamic import function.
 *  - Build RouteObject[] by walking the menu JSON.
 *
 * Requirements: pages should be under src/pages and have default exports.
 */

// Vite: dynamic import map for pages
const pageModules = import.meta.glob('../pages/**/*.tsx');

// Helper: resolve component lazy loader by component name
function resolveLoader(componentName: string) {
  // find module key that ends with `${componentName}.tsx`
  const matchKey = Object.keys(pageModules).find(
    (p) => p.endsWith(`/${componentName}.tsx`) || p.endsWith(`/${componentName}.jsx`),
  );
  if (!matchKey) return null;
  // return a function that does lazy import
  return () => pageModules[matchKey]() as Promise<{ default: React.ComponentType<any> }>;
}

export type RouteMeta = {
  authRequired?: boolean;
  permissions?: string[];
  title?: string;
  [k: string]: any;
};

export type GeneratedRoute = {
  path: string;
  element: React.LazyExoticComponent<React.ComponentType<any>> | null;
  children?: GeneratedRoute[];
  meta?: RouteMeta;
};

/**
 * Walk menu and return array of RouteObject (react-router) with lazy loaded components.
 * menuItems: normalized menu items (with component property)
 */
export function generateRoutesFromMenu(menuItems: RawMenuItem[]) {
  const walk = (items: RawMenuItem[]): GeneratedRoute[] =>
    items.map((it) => {
      const loader = it.component ? resolveLoader(it.component) : null;
      const element = loader ? React.lazy(loader) : null;

      const route: GeneratedRoute = {
        path: it.path || it.key || '', // ensure path
        element,
        meta: {
          authRequired: !!it.authRequired,
          permissions: it.permissions || [],
          title: it?.meta?.title || it.label,
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
 * Convert GeneratedRoute[] into react-router RouteObject[].
 * This wraps lazy components into a Suspense wrapper and optionally an AuthGuard.
 */

export function toReactRouterRoutes(
  generated: GeneratedRoute[],
  AuthGuard?: (el: React.ReactElement, meta?: RouteMeta) => React.ReactElement,
) {
  const wrapElement = (
    el: React.LazyExoticComponent<React.ComponentType<any>> | null,
    meta?: RouteMeta,
  ) => {
    if (!el) return undefined;
    // Suspense fallback can be a spinner or skeleton.
    const node = React.createElement(
      React.Suspense,
      { fallback: <div style={{ padding: 24 }}>Loading…</div> },
      React.createElement(el),
    );
    return AuthGuard ? AuthGuard(node, meta) : node;
  };

  const convert = (arr: GeneratedRoute[]): RouteObject[] =>
    arr.map((r) => ({
      path: r.path,
      element: wrapElement(r.element, r.meta),
      children: r.children ? convert(r.children) : undefined,
    }));

  return convert(generated);
}
