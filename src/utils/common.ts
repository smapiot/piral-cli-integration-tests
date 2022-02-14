import * as diff from 'jest-diff';

import { expect } from '@jest/globals';
import { promises as fsPromises, unlink } from 'fs';
import { resolve } from 'path';
import { ChildProcess } from 'child_process';
import { promisify } from 'util';
import { NO_DIFF_MESSAGE } from 'jest-diff/build/constants';
import { exists, rimraf } from './io';

fsPromises.rm = fsPromises.rm || promisify(unlink);

const hashTest = new RegExp(/index.\w*.js/);

export const cliVersion = process.env.CLI_VERSION || 'next';

export type FileAssertions = Record<string, boolean | ((content: string) => boolean)>;

export interface TestContext {
  root: string;
  assertFiles(files: FileAssertions): Promise<void>;
}

export interface TestEnvironment {
  dir: string;
  createTestContext(id: string): Promise<TestContext>;
}

export async function prepareTests(area: string): Promise<TestEnvironment> {
  const dir = resolve(__dirname, '..', '..', 'dist', area);
  await rimraf(dir);
  await fsPromises.mkdir(dir, { recursive: true });
  return {
    dir,
    async createTestContext(id) {
      const suffix = Math.random().toString(26).substring(2, 8);
      const root = resolve(dir, `${id}_${suffix}`);
      const assertFiles = async (files: FileAssertions) => {
        await Promise.all(
          Object.keys(files).map(async (file) => {
            const path = resolve(root, file);
            const handler = files[file];
            const status = await exists(path);

            if (typeof handler === 'function') {
              expect(status).toBeTruthy();
              const content = await fsPromises.readFile(path, 'utf8');
              expect(handler(content)).toBeTruthy();
            } else if (typeof handler === 'boolean') {
              expect(status).toBe(handler);
            }
          }),
        );
      };
      await fsPromises.mkdir(root, { recursive: true });
      return { root, assertFiles };
    },
  };
}

export async function cleanupForSnapshot(dirPath: string) {
  await rimraf(resolve(dirPath, 'node_modules'));
  await rimraf(resolve(dirPath, '.cache'));
  await fsPromises.rm(resolve(dirPath, 'package-lock.json'));

  const releasePath = resolve(dirPath, 'dist', 'release');

  if (await exists(releasePath)) {
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
                  resolve(releasePath, name),
                  resolve(releasePath, name.replace(hashTest, 'index.js')),
                );
              }),
          ),
        )
        .then(() => {
          return fsPromises
            .readFile(resolve(releasePath, 'index.js'))
            .then((str) => {
              const data = str.toString();

              if (data)
                return fsPromises.writeFile(
                  resolve(releasePath, 'index.js'),
                  data.toString().replace(hashTest, 'index.js'),
                );
            })
            .catch(() => {});
        }),
      fsPromises.readFile(resolve(releasePath, 'index.html')).then((str) => {
        const data = str.toString();

        if (data)
          return fsPromises.writeFile(
            resolve(releasePath, 'index.html'),
            data.toString().replace(hashTest, 'index.js'),
          );
      }),
    ]);
  }
}

export function getInitializerOptions(bundler: string) {
  const bundlerOption = !!bundler ? ` --bundler ${bundler} ` : '';

  return [
    //
    process.version.startsWith('v15') ? '-y --legacy-peer-deps -- ' : '',
    bundlerOption,
    '-y',
  ].join(' ');
}


export const snapshotOptions = {
  customCompare: [
    {
      check: (dir: string) => dir.endsWith('.tgz'),
      compare: () => NO_DIFF_MESSAGE,
    },

    {
      check: (dir: string) => dir.endsWith('package.json'),

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

export function serverHasStarted(done: () => void, port: number, timeout: any, ref: { unsubscribe: () => void }) {
  return (data) => {
    if (data.toString().includes(`Running at http://localhost:${port}`)) {
      clearTimeout(timeout);
      ref.unsubscribe();
      done();
    }
  };
}

export function waitForRunning(debugProcess: ChildProcess, port: number) {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server not started after 180s')), 180 * 1000);
    const ref = { unsubscribe: undefined };
    const onData = serverHasStarted(resolve, port, timeout, ref);
    debugProcess.stdout.on('data', onData);
    ref.unsubscribe = () => debugProcess.stdout.off('data', onData);
  });
}
