import { baseConfig } from '@monorepo/eslint-config';

/**
 * ESLint configuration for NestJS server application.
 *
 * @type {import("eslint").Linter.Config}
 * */
export default [
  ...baseConfig,
  {
    ignores: ['eslint.config.mjs', 'jest.config.cjs'],
  },
  {
    files: ['src/**/*.ts', 'src/**/*.spec.ts'],
    languageOptions: {
      parserOptions: {
        project: true,
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
              pattern:
                '{$adapters,$decorators,$exceptions,$filters,$guards,$interceptors,$utils,$domains/**,$modules/**,$shared/**}',
              group: 'internal',
            },
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true, orderImportKind: 'asc' },
        },
      ],
    },
  },
];
