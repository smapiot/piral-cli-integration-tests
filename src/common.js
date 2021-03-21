const fs = require('fs');
const path = require('path');
const diff = require('jest-diff');
const rimraf = promisify(require('rimraf'));

const { exec } = require('child_process');
const { promisify } = require('util');
const { type } = require('os');

const fsPromises = fs.promises;
fsPromises.rm = fsPromises.rm || promisify(fs.unlink);

const cliVersion = process.env.CLI_VERSION || 'next';

const execute = promisify(exec);

const cleanDir = async (dirPath) => {
  await rimraf(dirPath);
  await fsPromises.mkdir(dirPath);
};

const hashTest = new RegExp(/index.\w*.js/);
const cleanupForSnapshot = async (dirPath) => {
  await rimraf(path.resolve(dirPath, 'node_modules'));
  await rimraf(path.resolve(dirPath, '.cache'));
  await fsPromises.rm(path.resolve(dirPath, 'package-lock.json'));

  const releasePath = path.resolve(dirPath, 'dist', 'release');
  if (await fsPromises.stat(releasePath).catch(() => {}))
    await Promise.all([
      fsPromises
        .readdir(releasePath)
        .then((files) =>
          Promise.all(
            files
              .filter((name) => {
                return hashTest.test(name);
              })
              .map((name) => {
                return fsPromises.rename(
                  path.resolve(releasePath, name),
                  path.resolve(releasePath, name.replace(hashTest, 'index.js')),
                );
              }),
          ),
        )
        .then(() => {
          return fsPromises
            .readFile(path.resolve(releasePath, 'index.js'))
            .then((str) => {
              data = str.toString();

              if (data)
                return fsPromises.writeFile(
                  path.resolve(releasePath, 'index.js'),
                  data.toString().replace(hashTest, 'index.js'),
                );
            })
            .catch(() => {});
        }),
      fsPromises.readFile(path.resolve(releasePath, 'index.html')).then((str) => {
        data = str.toString();
        if (data)
          return fsPromises.writeFile(
            path.resolve(releasePath, 'index.html'),
            data.toString().replace(hashTest, 'index.js'),
          );
      }),
    ]);
};

const getInitializerOptions = (bundler) => {
  const bundlerOption = !!bundler ? ` --bundler ${bundler} ` : '';

  return [
    //
    process.version.startsWith('v15') ? '-y --legacy-peer-deps -- ' : '',
    bundlerOption,
    '-y',
  ].join(' ');
};

const isNodeV15 = process.version.startsWith('v15') && type().startsWith('Linux');

const snapshotOptions = {
  customCompare: [
    {
      check: (path) => path.endsWith('.tgz'),
      compare: () => '\x1B[2mCompared values have no visual difference.\x1B[22m',
    },

    {
      check: (path) => path.endsWith('package.json'),

      compare: (actualBuffer, expectedBuffer) => {
        const actual = JSON.parse(actualBuffer);
        const expected = JSON.parse(expectedBuffer);

        [
          // delete piral dependencies
          actual.dependencies,
          actual.devDependencies,
          expected.dependencies,
          expected.devDependencies,
        ].forEach((obj) =>
          Object.keys(obj)
            .filter((key) => key.startsWith('piral'))
            .forEach((key) => {
              delete obj[key];
            }),
        );

        delete actual.peerModules;
        delete expected.peerModules;

        // actual.name = actual.name.replace(/^(webpack[5]*|parcel)-/, "");

        return diff(actual, expected);
      },
    },
  ],
};

const serverHasStarted = (resolve, port, timeout, ref) => (data) => {
  if (data.toString().includes(`Running at http://localhost:${port}`)) {
    clearTimeout(timeout);
    ref.unsubscribe();
    resolve();
  }
};

const waitForRunning = (debugProcess, port) => {
  return new Promise((resolve, reject) => {
    timeout = setTimeout(() => reject(new Error('Server not started after 180s')), 180 * 1000);
    const ref = {};
    const onData = serverHasStarted(resolve, port, timeout, ref);
    debugProcess.stdout.on('data', onData);
    ref.unsubscribe = () => debugProcess.stdout.off('data', onData);
  });
};

const timeoutCommand = type().startsWith('Linux') ? 'timeout 60s ' : '';

const sleep = promisify(setTimeout);

module.exports = {
  execute,
  cleanDir,
  cleanupForSnapshot,
  getInitializerOptions,
  snapshotOptions,
  waitForRunning,
  timeoutCommand,
  cliVersion,
  sleep,
  isNodeV15,
};
