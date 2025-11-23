// src/main.tsx
import React from 'react';

import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import 'antd/dist/reset.css';

import App from './App';
import { AuthProvider } from './auth/AuthContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider
        initial={{
          roles: ['admin', 'doctor', 'nurse', 'receptionist', 'billing', 'pharmacy', 'lab'],
          permissions: ['*'],
          isAuthenticated: true,
        }}
      >
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
