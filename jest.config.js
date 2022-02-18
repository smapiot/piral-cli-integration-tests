const { resolve } = require('path');

module.exports = {
  collectCoverage: false,
  globals: {
    NODE_ENV: 'test',
    'ts-jest': {
      diagnostics: false,
    },
  },
  testEnvironmentOptions: {
    'jest-playwright': {
      browsers: ['chromium'],
      exitOnPageError: false,
      collectCoverage: false,
      launchOptions: {
        headless: true,
      },
    },
  },
  setupFilesAfterEnv: ['expect-playwright'],
  testTimeout: 60 * 1000,
  preset: 'jest-playwright-preset',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: resolve(__dirname, 'dist'),
      },
    ],
  ],
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  modulePathIgnorePatterns: ['<rootDir>/node_modules/'],
  roots: ['<rootDir>/src/'],
  testRegex: '(/__tests__/.*|\\.test)\\.ts$',
  testURL: 'http://localhost',
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.js$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {},
  verbose: true,
};
