import { RouterProvider } from '@tanstack/react-router';

import { useAuth } from '../auth/useAuth';
import { ChatFloatingLauncher } from '../chat/components/ChatFloatingLauncher';
import AppErrorBoundary from './components/AppErrorBoundary';
import { AppProviders } from './AppProviders';
import { router } from './router';

function RouterWithAuth() {
	const auth = useAuth();
	return <RouterProvider router={router} context={{ auth }} />;
}

export default function App() {
	return (
		<AppProviders>
			<AppErrorBoundary>
				<RouterWithAuth />
				<ChatFloatingLauncher />
			</AppErrorBoundary>
		</AppProviders>
	);
}
