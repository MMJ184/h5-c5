import { ConfigProvider, theme as antdTheme } from 'antd';
// src/theme/ThemeProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface ThemeContextValue {
	dark: boolean;
	toggleDark: () => void;
	primary: string;
	setPrimary: (c: string) => void;
	compact: boolean;
	toggleCompact: () => void;
	fontScale: number;
	setFontScale: (value: number) => void;
	highContrast: boolean;
	toggleHighContrast: () => void;
}

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
	const [compact, setCompact] = useState<boolean>(() => {
		try {
			const v = localStorage.getItem('theme.compact');
			return v ? JSON.parse(v) : false;
		} catch {
			return false;
		}
	});
	const [fontScale, setFontScaleState] = useState<number>(() => {
		try {
			const v = localStorage.getItem('theme.fontScale');
			return v ? Number(v) : 1;
		} catch {
			return 1;
		}
	});
	const [highContrast, setHighContrast] = useState<boolean>(() => {
		try {
			const v = localStorage.getItem('theme.contrast');
			return v ? JSON.parse(v) : false;
		} catch {
			return false;
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

	const toggleCompact = () => {
		setCompact((value) => {
			const next = !value;
			try {
				localStorage.setItem('theme.compact', JSON.stringify(next));
			} catch {}
			return next;
		});
	};

	const setFontScale = (value: number) => {
		const safe = Math.min(1.25, Math.max(0.85, value));
		setFontScaleState(safe);
		try {
			localStorage.setItem('theme.fontScale', String(safe));
		} catch {}
	};

	const toggleHighContrast = () => {
		setHighContrast((value) => {
			const next = !value;
			try {
				localStorage.setItem('theme.contrast', JSON.stringify(next));
			} catch {}
			return next;
		});
	};

	const themeConfig = useMemo(
		() => ({
			algorithm: compact
				? [dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm, antdTheme.compactAlgorithm]
				: dark
					? antdTheme.darkAlgorithm
					: antdTheme.defaultAlgorithm,
			token: {
				colorPrimary: primary,
				borderRadius: 8,
				fontSize: 14 * fontScale,
				colorTextBase: highContrast ? (dark ? '#ffffff' : '#111111') : undefined,
				colorTextSecondary: highContrast ? (dark ? '#d9d9d9' : '#3f3f3f') : undefined,
				colorBorder: highContrast ? (dark ? '#595959' : '#434343') : undefined,
			},
		}),
		[dark, primary, compact, fontScale, highContrast],
	);

	useEffect(() => {
		document.documentElement.style.fontSize = `${14 * fontScale}px`;
	}, [fontScale]);

	const ctxValue = useMemo(
		() => ({
			dark,
			toggleDark,
			primary,
			setPrimary,
			compact,
			toggleCompact,
			fontScale,
			setFontScale,
			highContrast,
			toggleHighContrast,
		}),
		[dark, toggleDark, primary, setPrimary, compact, toggleCompact, fontScale, setFontScale, highContrast, toggleHighContrast],
	);

	return (
		<ThemeContext.Provider value={ctxValue}>
			<ConfigProvider theme={themeConfig}>{children}</ConfigProvider>
		</ThemeContext.Provider>
	);
};
