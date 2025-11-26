// src/auth/AuthContext.tsx
import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

export type UserRoles = string[];
export type UserPermissions = string[];

export type AuthState = {
  roles: UserRoles;
  permissions: UserPermissions;
  isAuthenticated: boolean;
  user?: { id?: string; name?: string; email?: string } | null;
  // helpers
  setAuth?: (payload: {
    roles: UserRoles;
    permissions: UserPermissions;
    isAuthenticated: boolean;
    user?: { id?: string; name?: string; email?: string } | null;
  }) => void;
  login?: (opts: { username?: string; password?: string }) => Promise<void>;
  logout?: () => void;
};

const DEFAULT_AUTH: AuthState = {
  roles: [],
  permissions: [],
  isAuthenticated: false,
  user: null,
};

const STORAGE_KEY = 'h5care_auth_v1';

const AuthContext = createContext<AuthState>(DEFAULT_AUTH);

/**
 * Persisted AuthProvider:
 * - restores from localStorage on mount
 * - provides setAuth, login (mock), logout
 */
export const AuthProvider: React.FC<React.PropsWithChildren<{ initial?: Partial<AuthState> }>> =
  ({ children, initial }) => {
    const [state, setState] = useState<AuthState>(() => {
      // try to restore from localStorage synchronously
      try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
        if (raw) {
          return { ...DEFAULT_AUTH, ...(JSON.parse(raw) as Partial<AuthState>) } as AuthState;
        }
      } catch {
        // ignore
      }
      return { ...DEFAULT_AUTH, ...(initial ?? {}) } as AuthState;
    });

    // persist on change
    useEffect(() => {
      try {
        const toStore = {
          roles: state.roles,
          permissions: state.permissions,
          isAuthenticated: state.isAuthenticated,
          user: state.user ?? null,
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
      } catch {
        // ignore
      }
    }, [state.roles, state.permissions, state.isAuthenticated, state.user]);

    const setAuth = (payload: {
      roles: UserRoles;
      permissions: UserPermissions;
      isAuthenticated: boolean;
      user?: { id?: string; name?: string; email?: string } | null;
    }) => {
      setState((s) => ({ ...s, ...payload }));
    };

    // Mock login function (no external API) – simulate latency and set roles
    const login = async (opts: { username?: string; password?: string }) => {
      // simulate a small delay like a real request
      await new Promise((r) => setTimeout(r, 600));

      // simplistic mock: any non-empty username/password authenticates
      if (!opts?.username || !opts?.password) {
        return Promise.reject(new Error('Invalid credentials'));
      }

      // derive roles / permissions for demo
      const isAdmin = opts.username === 'admin@h5care.local';

      setState((s) => ({
        ...s,
        isAuthenticated: true,
        user: { id: 'user_1', name: opts.username?.split('@')[0], email: opts.username },
        roles: isAdmin ? ['admin'] : ['user'],
        permissions: isAdmin ? ['*'] : ['appointments.view', 'patients.view'],
      }));
      return Promise.resolve();
    };

    const logout = () => {
      setState({ ...DEFAULT_AUTH, isAuthenticated: false, user: null });
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        //
      }
    };

    const value: AuthState = useMemo(
      () => ({
        roles: state.roles,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        setAuth,
        login,
        logout,
      }),
      [state.roles, state.permissions, state.isAuthenticated, state.user],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  };

export function useAuth() {
  return useContext(AuthContext);
}
