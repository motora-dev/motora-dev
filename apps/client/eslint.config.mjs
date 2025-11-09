import { baseConfig } from '@monorepo/eslint-config';
import nextConfig from 'eslint-config-next';
import jest from 'eslint-plugin-jest';
import jestdom from 'eslint-plugin-jest-dom';
import storybook from 'eslint-plugin-storybook';
import testinglibrary from 'eslint-plugin-testing-library';

const config = [
  ...nextConfig,
  ...storybook.configs['flat/recommended'],
  // // @feature-sliced languageOptions
  // {
  //   languageOptions: { ecmaVersion: 'latest' },
  // },
  // Custom import/order for FSD structure
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external'], ['internal', 'parent', 'sibling', 'index', 'object'], 'type'],
          pathGroups: [
            {
              pattern: '{server-only,client-only}',
              group: 'builtin',
            },
            {
              pattern: '${app,domains,layouts,modules,shared}/**/*',
              group: 'internal',
            },
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
  // Use tsconfig.spec.json for test files to enable typed linting on specs
  {
    files: ['src/**/*.spec.{ts,tsx}'],
    plugins: {
      jest: jest,
      'testing-library': testinglibrary,
      'jest-dom': jestdom,
    },
    languageOptions: {
      parserOptions: {
        project: 'tsconfig.spec.json',
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
    },
  },
];

export default config;
