module.exports = {
  collectCoverage: false,
  globals: {
    NODE_ENV: 'test',
    'ts-jest': {
      diagnostics: false,
    },
  },
  testTimeout: 60 * 1000,
  preset: 'jest-playwright-preset',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'dist',
      },
    ],
  ],
  roots: ['src/'],
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
