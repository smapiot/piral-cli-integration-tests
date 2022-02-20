const { resolve } = require('path');

const outDirName = process.env.OUTDIR || 'dist';
const outputDirectory = resolve(process.cwd(), outDirName);

process.env.OUTPUT_DIR = outputDirectory;

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
        outputDirectory,
      },
    ],
  ],
  transformIgnorePatterns: [
    '<rootDir>/node_modules/',
    'node_modules/@babel',
    'node_modules/@jest',
    'signal-exit',
    'is-typedarray',
  ],
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
