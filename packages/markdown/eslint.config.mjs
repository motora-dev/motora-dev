import { baseConfig } from '@monorepo/eslint-config';

/**
 * ESLint configuration for Markdown package.
 *
 **/
export default [
  ...baseConfig,
  {
    ignores: ['eslint.config.mjs', 'jest.config.cjs'],
  },
];
