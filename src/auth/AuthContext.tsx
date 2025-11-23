// src/auth/AuthContext.tsx
import React, { createContext, useContext, useMemo, useState } from 'react';

export type UserRoles = string[];
export type UserPermissions = string[];

export type AuthState = {
  roles: UserRoles;
  permissions: UserPermissions;
  isAuthenticated: boolean;
  // helper to replace/update (used by mock provider or login flow)
  setAuth?: (payload: {
    roles: UserRoles;
    permissions: UserPermissions;
    isAuthenticated: boolean;
  }) => void;
};

const DEFAULT_AUTH: AuthState = {
  roles: [],
  permissions: [],
  isAuthenticated: false,
};

const AuthContext = createContext<AuthState>(DEFAULT_AUTH);

/**
 * AuthProvider
 * - Accepts initial state and exposes setAuth to update (useful in dev).
 * - In production you would replace setAuth to read from token / fetch user profile.
 */
export const AuthProvider: React.FC<React.PropsWithChildren<{ initial?: Partial<AuthState> }>> = ({
  children,
  initial,
}) => {
  const [state, setState] = useState<AuthState>({
    ...DEFAULT_AUTH,
    ...(initial ?? {}),
    setAuth: undefined,
  } as AuthState);

  const setAuth = (payload: {
    roles: UserRoles;
    permissions: UserPermissions;
    isAuthenticated: boolean;
  }) => {
    setState((s) => ({ ...s, ...payload }));
  };

  const value: AuthState = useMemo(
    () => ({
      roles: state.roles,
      permissions: state.permissions,
      isAuthenticated: state.isAuthenticated,
      setAuth,
    }),
    [state.roles, state.permissions, state.isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  return useContext(AuthContext);
}
