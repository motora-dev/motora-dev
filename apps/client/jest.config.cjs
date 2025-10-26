/** @type {import('jest').Config} */
module.exports = {
  roots: ['<rootDir>/src/'],
  rootDir: '.',
  testEnvironment: 'jsdom',
  collectCoverage: process.env.COLLECT_COVERAGE === 'true',
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/**/*.spec.ts', '!index.ts'],
  coverageDirectory: './coverage/jest',
  coverageReporters: ['text', 'json', 'lcov'],
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/?(*.)+(spec).(ts)'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.spec.json',
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^$app/(.*)$': '<rootDir>/src/app/$1',
    '^$domains/(.*)$': '<rootDir>/src/domains/$1',
    '^$layouts/(.*)$': '<rootDir>/src/app/_components/layouts/$1',
    '^$modules/(.*)$': '<rootDir>/src/modules/$1',
    '^$shared/(.*)$': '<rootDir>/src/shared/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
