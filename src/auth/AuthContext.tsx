import React, { createContext, useCallback, useMemo, useState } from 'react';

import { API_BASE_URL } from '../api/env';
import { clearTokens, setTokens } from './auth.utils';

export interface AuthState {
	isAuthenticated: boolean;
	roles: string[];
	permissions: string[];
	user?: {
		id: string;
		name: string;
		email: string;
	};
}

export interface AuthContextValue extends AuthState {
	setAuth?: (next: Partial<AuthState>) => void;
	login?: (payload: { username: string; password: string }) => Promise<void>;
	logout?: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
const AUTH_API_ENABLED = import.meta.env.VITE_AUTH_API_ENABLED === 'true';

function normalizeBaseUrl(url: string) {
	if (!url || url === '/') return '';
	return url.replace(/\/+$/, '');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [auth, setAuthState] = useState<AuthState>({
		isAuthenticated: false,
		roles: [],
		permissions: [],
	});

	const setAuth = useCallback((next: Partial<AuthState>) => {
		setAuthState((prev) => ({ ...prev, ...next }));
	}, []);

	const login = useCallback(async (payload: { username: string; password: string }) => {
		if (!payload.username || !payload.password) {
			throw new Error('Missing credentials');
		}

		if (AUTH_API_ENABLED) {
			const base = normalizeBaseUrl(API_BASE_URL);
			const loginUrl = `${base}/auth/login`;

			try {
				const res = await fetch(loginUrl, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						email: payload.username,
						password: payload.password,
					}),
				});

				if (!res.ok) {
					if (res.status === 401 || res.status === 403) {
						throw new Error('Invalid email or password');
					}
					throw new Error('Login service unavailable');
				}

				const json = (await res.json()) as {
					accessToken?: string;
					refreshToken?: string;
					user?: { id?: string; name?: string; email?: string };
					roles?: string[];
					permissions?: string[];
				};

				if (json.accessToken) {
					setTokens({
						accessToken: json.accessToken,
						refreshToken: json.refreshToken,
					});
				}

				setAuthState((prev) => ({
					...prev,
					isAuthenticated: true,
					roles: json.roles ?? ['admin'],
					permissions: json.permissions ?? ['*'],
					user: {
						id: json.user?.id ?? payload.username,
						name: json.user?.name ?? payload.username.split('@')[0] ?? payload.username,
						email: json.user?.email ?? payload.username,
					},
				}));
				return;
			} catch (error) {
				if (error instanceof TypeError) {
					throw new Error('Not able to connect to server');
				}
				throw error;
			}
		}

		setAuthState((prev) => ({
			...prev,
			isAuthenticated: true,
			roles: ['admin'],
			permissions: ['*'],
			user: {
				id: payload.username,
				name: payload.username.split('@')[0] ?? payload.username,
				email: payload.username,
			},
		}));
	}, []);

	const logout = useCallback(() => {
		clearTokens();
		setAuthState({
			isAuthenticated: false,
			roles: [],
			permissions: [],
		});
	}, []);

	const value = useMemo(() => ({ ...auth, setAuth, login, logout }), [auth, setAuth, login, logout]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
