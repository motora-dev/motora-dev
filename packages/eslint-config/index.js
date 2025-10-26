import js from '@eslint/js';
import boundariesPlugin from 'eslint-plugin-boundaries';
import importPlugin from 'eslint-plugin-import';
import eslintConfigPrettier from 'eslint-config-prettier';
import turboPlugin from 'eslint-plugin-turbo';
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
      'boundaries/elements': [
        {
          type: 'domains',
          pattern: '$domains/**',
        },
        {
          type: 'modules',
          pattern: '$modules/**',
        },
        {
          type: 'shared',
          pattern: '$shared/**',
        },
      ],
    },
    plugins: {
      boundaries: boundariesPlugin,
      import: importPlugin,
      turbo: turboPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
      // enforce consistent import order across all workspaces
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external', 'internal'], ['parent', 'sibling', 'index', 'object'], 'type'],
          pathGroups: [
            {
              pattern: '${domains,modules,shared}/**',
              group: 'parent',
            },
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true, orderImportKind: 'asc' },
        },
      ],
      'boundaries/element-types': [
        'error',
        {
          default: 'allow',
          rules: [
            {
              from: 'modules',
              disallow: ['domains'],
              message: 'Modules should not depend on domains.',
            },
            {
              from: 'shared',
              disallow: ['domains', 'modules'],
              message: 'Shared should not depend on domains or modules.',
            },
          ],
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
