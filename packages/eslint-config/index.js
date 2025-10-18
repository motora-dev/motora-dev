import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import turboPlugin from 'eslint-plugin-turbo';
import importPlugin from 'eslint-plugin-import';
import onlyWarn from 'eslint-plugin-only-warn';
import tseslint from 'typescript-eslint';

/**
 * Shared ESLint configuration for the monorepo.
 * This provides the base configuration that all packages extend.
 *
 * @type {import("eslint").Linter.Config}
 */
export const baseConfig = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    settings: {
      'import/resolver': {
        typescript: {
          project: ['apps/*/tsconfig.json', 'apps/*/tsconfig.spec.json', 'packages/*/tsconfig.json'],
        },
      },
    },
    plugins: {
      turbo: turboPlugin,
      import: importPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
      // enforce consistent import order across all workspaces
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external'], 'internal', ['sibling', 'parent', 'index', 'object'], 'type'],
          pathGroups: [
            {
              pattern: '{@*,@*/**}',
              group: 'internal',
            },
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true, orderImportKind: 'asc' },
        },
      ],
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: ['dist/**', 'build/**', '.next/**', 'node_modules/**'],
  },
];
