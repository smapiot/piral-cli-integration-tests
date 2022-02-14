import * as rimrafSync from 'rimraf';
import { promises as fsPromises } from 'fs';
import { promisify } from 'util';

export const rimraf = promisify(rimrafSync);

export async function cleanDir(dirPath: string) {
  await rimraf(dirPath);
  await fsPromises.mkdir(dirPath);
}

export async function exists(path: string) {
  try {
    await fsPromises.lstat(path);
    return true;
  } catch {
    return false;
  }
}
