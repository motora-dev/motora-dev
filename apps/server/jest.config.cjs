/** @type {import('jest').Config} */
module.exports = {
  roots: ['<rootDir>/src/'],
  rootDir: '.',

  // カバレッジ設定
  collectCoverage: process.env.COLLECT_COVERAGE === 'true',
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/main.ts', '!index.ts'],
  coverageProvider: 'babel',
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'json', 'lcov'],

  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '.*\\.spec.ts$',
  testEnvironment: 'node',

  // ESM設定
  extensionsToTreatAsEsm: ['.ts'],

  // ESMモードでjestグローバルを利用可能にするセットアップファイル
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.spec.json',
      },
    ],
  },

  moduleNameMapper: {
    // ESMでのインポートパス解決 (.js -> .ts)
    '^(\\.{1,2}/.*)\\.js$': '$1',

    // パスエイリアス
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
