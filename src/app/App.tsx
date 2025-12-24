import { RouterProvider } from '@tanstack/react-router';

import { useAuth } from '../auth/useAuth';
import { AppProviders } from './AppProviders';
import { router } from './router';

function RouterWithAuth() {
	const auth = useAuth();
	return <RouterProvider router={router} context={{ auth }} />;
}

export default function App() {
	return (
		<AppProviders>
			<RouterWithAuth />
		</AppProviders>
	);
}
