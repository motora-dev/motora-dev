import { baseConfig } from '@monorepo/eslint-config';

/**
 * ESLint configuration for Angular client application.
 *
 * @type {import("eslint").Linter.Config}
 * */
export default [
  ...baseConfig,
  {
    ignores: ['*.config.cjs', '*.config.mjs'],
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external'], ['internal', 'parent', 'sibling', 'index', 'object'], 'type'],
          pathGroups: [
            {
              pattern: '$app',
              group: 'internal',
            },
            {
              pattern: '$app/**',
              group: 'internal',
            },
            {
              pattern: '$components',
              group: 'internal',
            },
            {
              pattern: '$components/**',
              group: 'internal',
            },
            {
              pattern: '$domains',
              group: 'internal',
            },
            {
              pattern: '$domains/**',
              group: 'internal',
            },
            {
              pattern: '$environments',
              group: 'internal',
            },
            {
              pattern: '$modules',
              group: 'internal',
            },
            {
              pattern: '$modules/**',
              group: 'internal',
            },
            {
              pattern: '$shared',
              group: 'internal',
            },
            {
              pattern: '$shared/**',
              group: 'internal',
            },
          ],
          alphabetize: { order: 'asc', caseInsensitive: true, orderImportKind: 'asc' },
          'newlines-between': 'always',
        },
      ],
    },
  },
];
