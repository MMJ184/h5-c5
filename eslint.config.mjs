// eslint.config.js
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import unusedImports from 'eslint-plugin-unused-imports';
import perfectionist from 'eslint-plugin-perfectionist';
import prettierConfig from 'eslint-config-prettier';

export default [
  // ✅ Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.vite/**',
      '**/tmp/**',
    ],
  },

  // ✅ TypeScript ESLint (recommended + stylistic) for TS + TSX
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
  })),
  ...tseslint.configs.stylistic.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
  })),

  // ✅ Main rules for TS/TSX (React 19 + hooks + unused imports + perfectionist)
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
      'unused-imports': unusedImports,
      perfectionist,
    },
    rules: {
      // -----------------------------
      // React + Hooks
      // -----------------------------
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/prop-types': 'off',

      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Vite HMR safety (recommended)
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // -----------------------------
      // Remove unused imports automatically (key requirement)
      // -----------------------------
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Turn off TS unused-vars to avoid duplicate warnings
      '@typescript-eslint/no-unused-vars': 'off',

      // -----------------------------
      // Import sorting & class member sorting
      // -----------------------------
      'perfectionist/sort-imports': [
        'warn',
        {
          type: 'alphabetical',
          order: 'asc',
          ignoreCase: true,
          newlinesBetween: 'always',
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'type',
            'object',
          ],
          // Optional: once you add TS path aliases like @app/*, @features/*
          // internalPattern: ['^@/.*', '^@app/.*', '^@features/.*', '^@components/.*', '^@api/.*'],
        },
      ],

      'perfectionist/sort-classes': [
        'error',
        {
          type: 'unsorted',
          ignoreCase: true,
          specialCharacters: 'keep',
          partitionByComment: false,
          partitionByNewLine: false,
          newlinesBetween: 'ignore',
          ignoreCallbackDependenciesPatterns: ['^computed$'],
          groups: [
            'index-signature',
            { newlinesBetween: 1 },
            ['static-property', 'static-accessor-property'],
            ['static-get-method', 'static-set-method'],
            ['protected-static-property', 'protected-static-accessor-property'],
            ['protected-static-get-method', 'protected-static-set-method'],
            ['private-static-property', 'private-static-accessor-property'],
            ['private-static-get-method', 'private-static-set-method'],
            'static-block',
            { newlinesBetween: 1 },
            ['property', 'accessor-property'],
            ['get-method', 'set-method'],
            ['protected-property', 'protected-accessor-property'],
            ['protected-get-method', 'protected-set-method'],
            ['private-property', 'private-accessor-property'],
            ['private-get-method', 'private-set-method'],
            { newlinesBetween: 1 },
            'readonly-properties',
            { newlinesBetween: 1 },
            'constructor',
            { newlinesBetween: 1 },
            ['static-method', 'static-function-property'],
            { newlinesBetween: 1 },
            ['protected-static-method', 'protected-static-function-property'],
            { newlinesBetween: 1 },
            ['private-static-method', 'private-static-function-property'],
            { newlinesBetween: 1 },
            ['method', 'function-property'],
            { newlinesBetween: 1 },
            ['protected-method', 'protected-function-property'],
            { newlinesBetween: 1 },
            ['private-method', 'private-function-property'],
            { newlinesBetween: 1 },
            'unknown',
          ],
          customGroups: [
            {
              groupName: 'readonly-properties',
              selector: 'property',
              modifiers: ['readonly'],
            },
          ],
        },
      ],

      // -----------------------------
      // General
      // -----------------------------
      'no-console': 'warn',
    },
  },

  // ✅ Disable rules that conflict with Prettier formatting
  prettierConfig,
];
