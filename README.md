# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
	globalIgnores(['dist']),
	{
		files: ['**/*.{ts,tsx}'],
		extends: [
			// Other configs...

			// Remove tseslint.configs.recommended and replace with this
			tseslint.configs.recommendedTypeChecked,
			// Alternatively, use this for stricter rules
			tseslint.configs.strictTypeChecked,
			// Optionally, add this for stylistic rules
			tseslint.configs.stylisticTypeChecked,

			// Other configs...
		],
		languageOptions: {
			parserOptions: {
				project: ['./tsconfig.node.json', './tsconfig.app.json'],
				tsconfigRootDir: import.meta.dirname,
			},
			// other options...
		},
	},
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.mjs
import reactDom from 'eslint-plugin-react-dom';
import reactX from 'eslint-plugin-react-x';

export default defineConfig([
	globalIgnores(['dist']),
	{
		files: ['**/*.{ts,tsx}'],
		extends: [
			// Other configs...
			// Enable lint rules for React
			reactX.configs['recommended-typescript'],
			// Enable lint rules for React DOM
			reactDom.configs.recommended,
		],
		languageOptions: {
			parserOptions: {
				project: ['./tsconfig.node.json', './tsconfig.app.json'],
				tsconfigRootDir: import.meta.dirname,
			},
			// other options...
		},
	},
]);
```

project-root/
├── public/ # static assets served as-is
│ └── favicon.svg
│
├── index.html
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.cjs
├── postcss.config.cjs
├── eslint.config.mjs
├── .prettierrc
├── .editorconfig
│
└── src/
├── app/
│ ├── main.tsx # Vite entry
│ ├── App.tsx # Root app (providers + layout shell)
│ │
│ ├── config/ # runtime env + constants
│ │ ├── env.ts # API_URL, version, feature flags
│ │ ├── constants.ts
│ │ └── theme-tokens.ts # shared design tokens (light/dark)
│ │
│ ├── providers/
│ │ ├── RouterProvider.tsx
│ │ ├── QueryProvider.tsx
│ │ ├── ThemeProvider.tsx
│ │ └── I18nProvider.tsx
│ │
│ ├── routes/ # TANSTACK ROUTER ROUTES (manual)
│ │ ├── root.routes.tsx # defines router tree + base layouts
│ │ ├── auth.routes.tsx
│ │ ├── dashboard.routes.tsx
│ │ ├── settings.routes.tsx
│ │ └── error.routes.tsx
│ │
│ └── types/
│ └── app.types.ts # general app-level TS types
│
│
├── features/ # DOMAIN-BASED FEATURE MODULES
│ ├── auth/
│ │ ├── routes/ # route components only
│ │ │ ├── LoginPage.tsx
│ │ │ └── RegisterPage.tsx
│ │ ├── components/ # UI for auth flows
│ │ │ ├── LoginForm.tsx
│ │ │ └── OTPInput.tsx
│ │ ├── hooks/
│ │ │ ├── useLogin.ts # wraps TanStack Query mutation
│ │ │ └── useAuthState.ts
│ │ ├── api/ # feature-specific API mapping
│ │ │ ├── auth.mapper.ts
│ │ │ └── auth.adapter.ts
│ │ ├── validation/
│ │ │ └── login.schema.ts (Zod)
│ │ ├── types/
│ │ │ └── auth.types.ts
│ │ └── index.ts # grouped exports for feature
│ │
│ ├── dashboard/
│ │ ├── routes/
│ │ │ ├── DashboardPage.tsx
│ │ │ └── AnalyticsPage.tsx
│ │ ├── components/
│ │ │ ├── StatsCard.tsx
│ │ │ └── OverviewPanel.tsx
│ │ ├── charts/ # ECHARTS instances used by dashboard
│ │ │ ├── SalesChart.tsx
│ │ │ ├── GrowthChart.tsx
│ │ │ └── chart.theme.ts
│ │ ├── hooks/
│ │ │ └── useDashboardStats.ts
│ │ ├── types/
│ │ │ └── dashboard.types.ts
│ │ └── index.ts
│ │
│ └── settings/
│ ├── routes/
│ ├── components/
│ ├── hooks/
│ ├── types/
│ └── index.ts
│
│
├── api/ # API LAYER (GLOBAL)
│ ├── client.ts # axios/fetch instance + interceptors
│ ├── endpoints.ts # all REST endpoints
│ │
│ ├── queries/ # TANSTACK QUERY HOOKS
│ │ ├── auth.queries.ts
│ │ ├── dashboard.queries.ts
│ │ ├── settings.queries.ts
│ │ └── common.queries.ts
│ │
│ ├── types/ # DTO types for API contract
│ │ ├── auth.types.ts
│ │ ├── dashboard.types.ts
│ │ └── common.types.ts
│ │
│ └── keys/ # query key factories
│ ├── auth.keys.ts
│ ├── dashboard.keys.ts
│ └── settings.keys.ts
│
│
├── components/ # REUSABLE UI BUILDING BLOCKS
│ ├── layout/
│ │ ├── AppLayout.tsx
│ │ ├── HeaderBar.tsx # theme + lang switchers
│ │ └── Sidebar.tsx
│ │
│ ├── ui/ # UI wrappers around AntD + Tailwind
│ │ ├── Button.tsx
│ │ ├── Card.tsx
│ │ ├── Modal.tsx
│ │ ├── FormField.tsx
│ │ └── Input.tsx
│ │
│ ├── charts/ # BASE ECHARTS WRAPPER
│ │ ├── EChartBase.tsx
│ │ ├── EChartResizeHook.ts # handles auto-resizing
│ │ └── chart.types.ts
│ │
│ └── feedback/
│ ├── LoadingSpinner.tsx
│ ├── ErrorState.tsx
│ └── EmptyState.tsx
│
│
├── locales/ # I18N FILES (future ready)
│ ├── en/
│ │ ├── common.json
│ │ ├── auth.json
│ │ └── dashboard.json
│ ├── hi/
│ └── gu/
│ └── index.ts # locale loader / merge logic
│
│
├── styles/
│ ├── index.css # Tailwind base + imports
│ ├── antd-overrides.css # custom antd global styles
│ └── themes/ # optional theme-specific CSS
│ ├── light.css
│ └── dark.css
│
│
├── hooks/ # CROSS-CUTTING APPLICATION HOOKS
│ ├── useTheme.ts
│ ├── useLocale.ts
│ ├── useDebounce.ts
│ ├── useBreakpoint.ts
│ └── useSession.ts # reads session from TanQuery
│
│
├── lib/ # PURE UTILITIES (NO REACT inside)
│ ├── date.ts
│ ├── number.ts
│ ├── storage.ts # local/session storage
│ ├── log.ts # logging abstraction
│ ├── analytics.ts # analytics abstraction
│ └── helpers/
│ ├── formatMoney.ts
│ └── mergeDeep.ts
│
│
└── types/
├── global.d.ts # global TS definitions
└── misc.types.ts
