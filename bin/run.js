#!/usr/bin/env node

const Runtime = require('jest-runtime');
const { resolve } = require('path');

const origCreateHasteMap = Runtime.createHasteMap;

Runtime.createHasteMap = function (...args) {
  const result = origCreateHasteMap.call(this, ...args);
  result._options.retainAllFiles = true;
  return result;
};

const argv = process.argv;
const root = resolve(__dirname, '..', 'src');

const bundler = argv.pop();

if (argv.length < 2 || bundler.startsWith('-')) {
  console.error(`The bundler has not been specified correctly. It has to be the last argument.`);
  process.exit(1);
}

const [_node, _exec, ...rest] = argv;
const config = resolve(__dirname, '..', 'jest.config.js');

process.env.BUNDLER_PLUGIN = '';

require('jest').run([root, '--runInBand', ...rest], config);
