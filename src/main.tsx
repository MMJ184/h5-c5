import React from 'react';
import { createRoot } from 'react-dom/client';
import 'antd/dist/reset.css';

import './index.css';
import App from './app/App.tsx';
import './assets/styles/scrollbar.css';

createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
