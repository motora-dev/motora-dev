import angular from 'angular-eslint';

import { baseConfig } from '@monorepo/eslint-config';

/**
 * ESLint configuration for Angular client application.
 *
 * @type {import("eslint").Linter.Config}
 * */
export default [
  // Apply baseConfig only to TypeScript files
  ...baseConfig.map((config) => ({
    ...config,
    files: config.files || ['src/**/*.ts'],
  })),
  {
    ignores: ['*.config.cjs', '*.config.mjs', 'src/**/*.html'],
  },
  // Angular ESLint base configuration (includes plugins)
  {
    files: ['src/**/*.ts'],
    ...angular.configs.tsRecommended[0],
  },
  // TypeScript files configuration with Angular rules
  {
    files: ['src/**/*.ts'],
    ...angular.configs.tsRecommended[1],
    languageOptions: {
      ...angular.configs.tsRecommended[1].languageOptions,
      parserOptions: {
        ...angular.configs.tsRecommended[1].languageOptions?.parserOptions,
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    processor: angular.processInlineTemplates,
    rules: {
      ...angular.configs.tsRecommended[1].rules,
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: ['app'], style: 'camelCase' }],
      // 属性セレクターを使うコンポーネント（button, input等）はcamelCaseを許可
      '@angular-eslint/component-selector': 'off',
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
              pattern: '$environments',
              group: 'internal',
            },
            {
              pattern: '$i18n/**',
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
  // HTML template files configuration
  {
    files: ['src/**/*.html'],
    ...angular.configs.templateRecommended[0],
  },
  {
    files: ['src/**/*.html'],
    ...angular.configs.templateRecommended[1],
    rules: {
      ...angular.configs.templateRecommended[1].rules,
      ...angular.configs.templateAccessibility[1]?.rules,
    },
  },
];
