/** @type {import('jest').Config} */
module.exports = {
  roots: ['<rootDir>/src/'],
  rootDir: '.',
  testEnvironment: 'jsdom',
  collectCoverage: process.env.COLLECT_COVERAGE === 'true',
  collectCoverageFrom: ['src/**/*.ts', 'src/**/*.tsx', '!src/**/*.spec.ts', '!src/**/*.spec.tsx', '!src/**/*.d.ts'],
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'json'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['**/?(*.)+(spec).(ts|tsx)'],
  transform: {
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.spec.json',
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@libs/(.*)$': '<rootDir>/src/libs/$1',
    '^@components/libs/(.*)$': '<rootDir>/src/components/libs/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
