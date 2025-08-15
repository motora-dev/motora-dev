/** @type {import('jest').Config} */
module.exports = {
  roots: ['<rootDir>/src/'],
  rootDir: '.',
  collectCoverage: process.env.COLLECT_COVERAGE === 'true',
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/main.ts'],
  coverageProvider: 'babel',
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'json'],
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
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@adapters/(.*)$': '<rootDir>/src/libs/adapters/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@libs/(.*)$': '<rootDir>/src/libs/$1',
  },
};
