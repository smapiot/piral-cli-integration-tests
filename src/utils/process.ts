import { exec } from 'child_process';
import { promisify } from 'util';
import { type } from 'os';

export const execAsync = promisify(exec);

export const sleep = promisify(setTimeout);

export function run(cmd: string, cwd = process.cwd()) {
  return new Promise<string>((resolve, reject) => {
    exec(cmd, { cwd }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

export async function runWithJson<T = any>(cmd: string, cwd?: string) {
  const result = await run(cmd, cwd);
  return JSON.parse(result) as T;
}

export const timeoutCommand = type().startsWith('Linux') ? 'timeout 60s ' : '';

export const isNodeV15 = process.version.startsWith('v15') && type().startsWith('Linux');
