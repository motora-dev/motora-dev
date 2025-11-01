/** @type {import('jest').Config} */
module.exports = {
  roots: ['<rootDir>/src/'],
  rootDir: '.',
  collectCoverage: process.env.COLLECT_COVERAGE === 'true',
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts'],
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
};
