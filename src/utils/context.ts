import { expect } from '@jest/globals';
import { promises as fsPromises } from 'fs';
import { resolve, dirname } from 'path';
import { exists, globFiles } from './io';
import { run as runFrom, runAsync as runAsyncFrom } from './process';
import { FileAssertions, FileMutations, TestContext } from './types';

export function createTestContextFactory(dir: string) {
  const refs: Record<string, string> = {};

  return async (prefix: string): Promise<TestContext> => {
    const suffix = Math.random().toString(26).substring(2, 8);
    const id = `${prefix}_${suffix}`;
    const root = resolve(dir, id);
    const cleanups: Array<() => Promise<void>> = [];

    const assertFiles = async (files: FileAssertions) => {
      await Promise.all(
        Object.keys(files).map(async (file) => {
          const path = resolve(root, file);
          const handler = files[file];
          const status = await exists(path);

          if (typeof handler === 'function') {
            if (file.indexOf('*') === -1) {
              expect(file).toBePresent(status);
              const content = await fsPromises.readFile(path, 'utf8');
              await handler(content);
            } else {
              const files = await globFiles(root, file);
              await handler(files);
            }
          } else if (handler === true) {
            expect(file).toBePresent(status);
          } else if (handler === false) {
            expect(file).not.toBePresent(status);
          }
        }),
      );
    };

    const readFile = (file: string) => {
      const path = resolve(root, file);
      return fsPromises.readFile(path, 'utf8');
    };

    const setRef = (id: string, file: string) => {
      refs[id] = resolve(root, file);
    };

    const findFiles = (pattern: string) => {
      return globFiles(root, pattern);
    };

    const getRef = (id: string) => refs[id];

    const setFiles = async (files: FileMutations) => {
      await Promise.all(
        Object.keys(files).map(async (file) => {
          const path = resolve(root, file);
          const content = files[file];

          if (typeof content === 'string') {
            await fsPromises.mkdir(dirname(path), { recursive: true });
            await fsPromises.writeFile(path, content, 'utf8');
          } else if (typeof content === 'function') {
            const exists = await fsPromises.access(path).then(() => true, () => false);

            if (exists) {
              const original = await fsPromises.readFile(path, 'utf8');
              const modified = content(original);
              await fsPromises.writeFile(path, modified, 'utf8');
            } else {
              await fsPromises.mkdir(dirname(path), { recursive: true });
              const modified = content('');
              await fsPromises.writeFile(path, modified, 'utf8');
            }
          } else if (content === false) {
            await fsPromises.rm(path);
          } else {
            throw new Error('The given argument is wrong. It has to be either a string, function, or false.');
          }
        }),
      );
    };

    const run = (cmd: string) => runFrom(cmd, root);

    const runAsync = (cmd: string) => {
      const cp = runAsyncFrom(cmd, root);
      cleanups.push(() => {
        const result = cp.waitEnd();
        cp.end();
        return result;
      });
      return cp;
    };

    const clean = async () => {
      await Promise.all(cleanups.map((doCleanup) => doCleanup()));
    };

    await fsPromises.mkdir(root, { recursive: true });

    return {
      id,
      root,
      clean,
      setRef,
      getRef,
      readFile,
      setFiles,
      findFiles,
      assertFiles,
      run,
      runAsync,
    };
  };
}
