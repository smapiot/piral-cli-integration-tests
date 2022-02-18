import { exec } from 'child_process';
import { promisify } from 'util';
import { RunningProcess } from './types';

export const execAsync = promisify(exec);

export const sleep = promisify(setTimeout);

export function run(cmd: string, cwd = process.cwd()) {
  return new Promise<string>((resolve, reject) => {
    exec(cmd, { cwd }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.trim());
      }
    });
  });
}

export function runAsync(cmd: string, cwd = process.cwd()): RunningProcess {
  const cp = exec(cmd, { cwd });

  return {
    waitEnd() {
      return new Promise<void>((resolve, reject) => {
        cp.on('error', reject);
        cp.on('exit', resolve);
        cp.on('close', resolve);
      });
    },
    waitUntil(str) {
      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Process not started after 45s')), 45 * 1000);
        const onData = (data: Buffer) => {
          if (data.toString().includes(str)) {
            clearTimeout(timeout);
            cp.stdout.off('data', onData);
            resolve();
          }
        };
        cp.stdout.on('data', onData);
      });
    },
    end() {
      cp.kill('SIGTERM');
      cp.stdout.destroy();
      cp.stderr.destroy();
      cp.removeAllListeners();
    },
  };
}
