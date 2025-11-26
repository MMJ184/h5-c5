// src/auth/AuthGuard.tsx
import React, { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { RawMenuItem } from '../services/MenuServiceTypes';
import {useAuth} from "../auth/AuthContext.tsx";

/**
 * canUserAccess - same logic as menuAccess.isItemAllowed but exported for reuse
 *
 * Accepts a RawMenuItem-like object. Handles missing/partial shapes safely.
 */
export function canUserAccess(
  item: Partial<RawMenuItem> | undefined,
  roles: string[] = [],
  permissions: string[] = [],
): boolean {
  if (!item) return true;

  // 1) role check
  if (item.roles && item.roles.length > 0) {
    const hasRole = item.roles.some((r) => roles.includes(r));
    if (!hasRole) return false;
  }

  // 2) permission check
  if (item.permissions && item.permissions.length > 0) {
    // WILDCARD SUPPORT: "*" means full permission
    if (permissions.includes('*')) {
      return true;
    }

    const hasAll = item.permissions.every((p) => permissions.includes(p));
    if (!hasAll) return false;
  }

  return true;
}

/**
 * AuthGuard component
 *
 * Props:
 * - item?: Partial<RawMenuItem>  (route metadata; may be the minimal object produced by route generator)
 * - children: React.ReactElement
 *
 * Behavior:
 * - if route requires auth and user is not authenticated → redirect to /login (with `state.from` = current location)
 * - if user is authenticated but lacks roles/permissions → redirect to /403
 * - otherwise render children
 */
export default function AuthGuard({
                                    item,
                                    children,
                                  }: {
  item?: Partial<RawMenuItem>;
  children: React.ReactElement;
}) {
  const auth = useAuth();
  const location = useLocation();

  const requiresAuth = !!item?.authRequired;
  const hasAuth = !!auth?.isAuthenticated;

  // memoize permission check
  const allowed = useMemo(() => {
    // if item has no roles/permissions, considered allowed (unless auth required)
    return canUserAccess(item, auth?.roles ?? [], auth?.permissions ?? []);
  }, [item, auth?.roles, auth?.permissions]);

  // not authenticated -> redirect to login with return location
  if (requiresAuth && !hasAuth) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // authenticated but not allowed -> 403
  if (requiresAuth && hasAuth && !allowed) {
    return <Navigate to="/403" replace />;
  }

  // otherwise render
  return children;
}
