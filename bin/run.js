#!/usr/bin/env node

const jest = require('jest');
const { resolve } = require('path');

const argv = process.argv;
const root = resolve(__dirname, '..', 'src');

const bundler = argv.pop();

if (argv.length < 2 || bundler.startsWith('-')) {
  console.error(`The bundler has not been specified correctly. It has to be the last argument.`);
  process.exit(1);
}

const [node, _, ...rest] = argv;

process.env.BUNDLER_PLUGIN = '';

jest.run([node, root, ...rest], 'jest.config.js');
