// src/routes/AuthGuard.tsx
import React from 'react';

import { Navigate } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';
import type { RawMenuItem } from '../services/MenuServiceTypes';

/**
 * canUserAccess - same logic as menuAccess.isItemAllowed but exported for reuse
 */
export function canUserAccess(item: RawMenuItem, roles: string[] = [], permissions: string[] = []) {
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
 * Props:
 * - item: RawMenuItem (route metadata)
 * - children: the route element (component)
 *
 * Behavior:
 * - if route requires auth and user is not authenticated → redirect to /login
 * - if user is authenticated but lacks roles/permissions → redirect to /403
 * - otherwise render children
 */
export default function AuthGuard({
  item,
  children,
}: {
  item?: RawMenuItem;
  children: React.ReactElement;
}) {
  const auth = useAuth();

  // if route marked authRequired and user not authenticated -> /login
  if (item?.authRequired && !auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // roles/permissions enforcement
  if (item && (item.roles?.length || item.permissions?.length)) {
    const allowed = canUserAccess(item, auth.roles, auth.permissions);
    if (!allowed) {
      return <Navigate to="/403" replace />;
    }
  }

  return children;
}
