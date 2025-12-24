import React, { createContext, useMemo, useState } from 'react';

export interface AuthState {
	isAuthenticated: boolean;
	roles: string[];
	permissions: string[];
}

export type AuthContextValue = AuthState;

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [auth] = useState<AuthState>({
		isAuthenticated: true, // dev default
		roles: ['admin'],
		permissions: ['*'],
	});

	const value = useMemo(() => auth, [auth]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
