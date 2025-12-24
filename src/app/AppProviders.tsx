import React from 'react';

import { AuthProvider } from '../auth/AuthContext';
import { QueryProvider } from './providers/QueryProvider.tsx';
import { ThemeProvider } from './providers/ThemeProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider>
			<QueryProvider>
				<AuthProvider>{children}</AuthProvider>
			</QueryProvider>
		</ThemeProvider>
	);
}
