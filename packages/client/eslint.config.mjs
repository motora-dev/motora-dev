import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import jest from 'eslint-plugin-jest';
import testinglibrary from 'eslint-plugin-testing-library';
import jestdom from 'eslint-plugin-jest-dom';
import tsparser from '@typescript-eslint/parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const config = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  // Use tsconfig.spec.json for test files to enable typed linting on specs
  {
    files: ['src/**/*.spec.{ts,tsx}'],
    plugins: {
      jest: jest,
      'testing-library': testinglibrary,
      'jest-dom': jestdom,
    },
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: 'tsconfig.spec.json',
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
    },
  },
];

export default config;
