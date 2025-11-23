// src/theme/ThemeProvider.tsx
import React, { createContext, useContext, useMemo, useState } from 'react';

import { ConfigProvider, theme as antdTheme } from 'antd';

type ThemeContextValue = {
  dark: boolean;
  toggleDark: () => void;
  primary: string;
  setPrimary: (c: string) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

/**
 * ThemeProvider
 * Wrap your entire app with this. It applies ConfigProvider + Ant tokens
 * and provides helpers to change primary color and toggle dark mode.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem('theme.dark');
      return v ? JSON.parse(v) : false;
    } catch {
      return false;
    }
  });
  const [primary, setPrimaryState] = useState<string>(() => {
    try {
      return localStorage.getItem('theme.primary') || '#1677ff';
    } catch {
      return '#1677ff';
    }
  });

  const toggleDark = () => {
    setDark((d) => {
      const next = !d;
      try {
        localStorage.setItem('theme.dark', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const setPrimary = (c: string) => {
    setPrimaryState(c);
    try {
      localStorage.setItem('theme.primary', c);
    } catch {}
  };

  const themeConfig = useMemo(
    () => ({
      algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      token: {
        colorPrimary: primary,
        borderRadius: 8,
      },
    }),
    [dark, primary],
  );

  const ctxValue = useMemo(
    () => ({
      dark,
      toggleDark,
      primary,
      setPrimary,
    }),
    [dark, toggleDark, primary, setPrimary],
  );

  return (
    <ThemeContext.Provider value={ctxValue}>
      <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
};
