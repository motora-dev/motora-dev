/** @type {import('jest').Config} */
module.exports = {
  roots: ['<rootDir>/src/'],
  rootDir: '.',
  collectCoverage: process.env.COLLECT_COVERAGE === 'true',
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/main.ts', '!index.ts'],
  coverageProvider: 'babel',
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'json', 'lcov'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '.*\\.spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.spec.json',
      },
    ],
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@paralleldrive/cuid2$': '<rootDir>/test/__mocks__/@paralleldrive/cuid2.ts',
    '^\\$prisma/client$': '<rootDir>/src/generated/prisma-client/client',
    '^\\$adapters$': '<rootDir>/src/shared/adapters',
    '^\\$decorators$': '<rootDir>/src/shared/decorators',
    '^\\$domains/(.*)$': '<rootDir>/src/domains/$1',
    '^\\$exceptions$': '<rootDir>/src/shared/exceptions',
    '^\\$filters$': '<rootDir>/src/shared/filters',
    '^\\$guards$': '<rootDir>/src/shared/guards',
    '^\\$interceptors$': '<rootDir>/src/shared/interceptors',
    '^\\$modules/(.*)$': '<rootDir>/src/modules/$1',
    '^\\$shared/(.*)$': '<rootDir>/src/shared/$1',
    '^\\$utils$': '<rootDir>/src/shared/utils',
  },
};
