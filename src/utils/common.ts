import * as diff from 'jest-diff';

import { expect, describe, it, beforeEach } from '@jest/globals';
import { promises as fsPromises, unlink } from 'fs';
import { resolve } from 'path';
import { ChildProcess } from 'child_process';
import { promisify } from 'util';
import { NO_DIFF_MESSAGE } from 'jest-diff/build/constants';
import { exists, rimraf, copyAll, globFiles } from './io';
import { run } from './process';

fsPromises.rm = fsPromises.rm || promisify(unlink);

const hashTest = new RegExp(/index.\w*.js/);
const allFeatures = [
  'codegen',
  'splitting',
  'pilet.v0',
  'pilet.v1',
  'pilet.v2',
  'importmap.ref',
  'importmap.local',
  'build.pilet',
  'build.piral',
  'build.emulator',
  'debug.pilet',
  'debug.piral',
  'hmr',
].join(',');

export const cliVersion = process.env.CLI_VERSION || 'next';
export const selectedBundler = process.env.BUNDLER_PLUGIN || `piral-cli-webpack5@${cliVersion}`;
export const isBundlerPlugin = !!process.env.BUNDLER_PLUGIN;
export const bundlerFeatures = (process.env.BUNDLER_FEATURES || allFeatures).split(',');

export type FileAssertions = Record<string, boolean | ((content: any) => boolean)>;

export type FileMutations = Record<string, string | ((content: string) => string)>;

export interface TestContext {
  root: string;
  id: string;
  run(cmd: string): Promise<string>;
  assertFiles(files: FileAssertions): Promise<void>;
  setFiles(files: FileMutations): Promise<void>;
}

export interface TestEnvironment {
  dir: string;
  createTestContext(id: string): Promise<TestContext>;
}

export interface TestEnvironmentRef {
  env: TestEnvironment;
  setup(cb: (ctx: TestContext) => Promise<void>): void;
  test(
    prefix: string,
    description: string,
    bundlerFeatures: Array<string>,
    cb: (ctx: TestContext) => Promise<void>,
  ): void;
}

export function runTests(area: string, cb: (ref: TestEnvironmentRef) => void) {
  let template = undefined;
  const ref: TestEnvironmentRef = {
    env: undefined,
    setup(cb) {
      beforeEach(async () => {
        if (!template) {
          template = await ref.env.createTestContext('_template');
          await cb(template);
        }
      });
    },
    test(prefix, description, features, cb) {
      // either we run in the "standard repo" (i.e., not as a bundler plugin)
      // or we need to have some bundler-features defined (and all features should be available from the bundler - otherwise its broken by default)
      const canRun = !isBundlerPlugin || (features.length > 0 && features.every((s) => bundlerFeatures.includes(s)));
      const define = canRun ? it : it.skip;

      define(description, async () => {
        const ctx = await ref.env.createTestContext(prefix);

        if (template) {
          await copyAll(template.root, ctx.root);
        }

        await cb(ctx);
      });
    },
  };

  describe(area, () => {
    beforeAll(async () => {
      ref.env = await prepareTests(area);
    });

    cb(ref);
  });
}

export async function prepareTests(area: string): Promise<TestEnvironment> {
  const dir = resolve(__dirname, '..', '..', 'dist', area);
  await rimraf(dir);
  await fsPromises.mkdir(dir, { recursive: true });
  return {
    dir,
    async createTestContext(prefix) {
      const suffix = Math.random().toString(26).substring(2, 8);
      const id = `${prefix}_${suffix}`;
      const root = resolve(dir, id);
      const assertFiles = async (files: FileAssertions) => {
        await Promise.all(
          Object.keys(files).map(async (file) => {
            const path = resolve(root, file);
            const handler = files[file];
            const status = await exists(path);

            if (typeof handler === 'function') {
              if (file.indexOf('*') === -1) {
                expect(status).toBeTruthy();
                const content = await fsPromises.readFile(path, 'utf8');
                expect(handler(content)).toBeTruthy();
              } else {
                const files = await globFiles(root, file);
                expect(handler(files)).toBeTruthy();
              }
            } else if (typeof handler === 'boolean') {
              expect(status).toBe(handler);
            }
          }),
        );
      };
      const setFiles = async (files: FileMutations) => {
        await Promise.all(
          Object.keys(files).map(async (file) => {
            const path = resolve(root, file);
            const content = files[file];

            if (typeof content === 'string') {
              await fsPromises.writeFile(path, content, 'utf8');
            } else if (typeof content === 'function') {
              const original = await fsPromises.readFile(path, 'utf8');
              const modified = content(original);
              await fsPromises.writeFile(path, modified, 'utf8');
            }
          }),
        );
      };
      await fsPromises.mkdir(root, { recursive: true });
      return {
        id,
        root,
        setFiles,
        assertFiles,
        run(cmd) {
          return run(cmd, root);
        },
      };
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
