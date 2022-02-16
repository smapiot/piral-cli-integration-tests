import * as rimrafSync from 'rimraf';
import { promises as fsPromises } from 'fs';
import { resolve, relative } from 'path';
import { promisify } from 'util';

export const rimraf = promisify(rimrafSync);

export async function cleanDir(dirPath: string) {
  await rimraf(dirPath);
  await fsPromises.mkdir(dirPath);
}

function matches(pattern: string, name: string) {
  const parts = pattern.split('*');
  const last = parts.length - 1;
  let index = 0;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const nextIndex = name.indexOf(part, index);

    if (nextIndex === -1) {
      return false;
    } else if (i === 0 && nextIndex !== 0) {
      return false;
    } else if (i === last && nextIndex + part.length !== name.length) {
      return false;
    } else {
      index = nextIndex + parts.length;
    }
  }

  return true;
}

async function fillGlobFiles(root: string, dirs: Array<string>, file: string, files: Array<string>) {
  if (dirs.length > 0) {
    const dir = dirs.shift();

    if (dir.indexOf('*') !== -1) {
      const entries = await fsPromises.readdir(dir);

      await Promise.all(
        entries.map(async (entry) => {
          const path = resolve(root, entry);
          const stat = await fsPromises.lstat(path);

          if (stat.isDirectory() && matches(dir, entry)) {
            await fillGlobFiles(path, [...dirs], file, files);
          }
        }),
      );
    } else {
      const path = resolve(root, dir);

      if (await exists(path)) {
        await fillGlobFiles(path, [...dirs], file, files);
      }
    }
  } else if (file.indexOf('*') !== -1) {
    const entries = await fsPromises.readdir(root);

    await Promise.all(
      entries.map(async (entry) => {
        const path = resolve(root, entry);
        const stat = await fsPromises.lstat(path);

        if (stat.isFile() && matches(file, entry)) {
          files.push(path);
        }
      }),
    );
  } else {
    const path = resolve(root, file);

    if (await exists(path)) {
      files.push(path);
    }
  }

  return files;
}

export async function globFiles(root: string, pattern: string) {
  const [file, ...dirs] = pattern.split('/').reverse();
  const files: Array<string> = [];

  dirs.reverse();

  await fillGlobFiles(root, dirs, file, files);

  return files.map((file) => relative(root, file));
}

export async function copyAll(sourceFolder: string, targetFolder: string) {
  const sourceFiles = await fsPromises.readdir(sourceFolder);

  await Promise.all(
    sourceFiles.map(async (name) => {
      const sourceFile = resolve(sourceFolder, name);
      const targetFile = resolve(targetFolder, name);
      const stats = await fsPromises.lstat(sourceFile);

      if (stats.isDirectory()) {
        await fsPromises.mkdir(targetFile);
        await copyAll(sourceFile, targetFile);
      } else if (stats.isFile()) {
        await fsPromises.copyFile(sourceFile, targetFile);
      }
    }),
  );
}

export async function exists(path: string) {
  try {
    await fsPromises.lstat(path);
    return true;
  } catch {
    return false;
  }
}
