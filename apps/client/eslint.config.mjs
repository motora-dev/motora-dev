// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import jest from 'eslint-plugin-jest';
import jestdom from 'eslint-plugin-jest-dom';
import storybook from 'eslint-plugin-storybook';
import testinglibrary from 'eslint-plugin-testing-library';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const config = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  ...compat.extends('@feature-sliced'),
  ...storybook.configs['flat/recommended'],
  // @feature-sliced languageOptions
  {
    languageOptions: { ecmaVersion: 'latest' },
  },
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
  // Disable strict public API rule, rely on boundaries instead
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'import/no-internal-modules': 'off',
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
