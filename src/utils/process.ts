import { exec } from 'child_process';
import { promisify } from 'util';
import { RunningProcess } from './types';

export const execAsync = promisify(exec);

export const sleep = promisify(setTimeout);

export function run(cmd: string, cwd = process.cwd()) {
  return new Promise<string>((resolve, reject) => {
    exec(cmd, { cwd }, (err, result) => {
      if (err) {
        if (typeof result === 'string') {
          reject(result.trim());
        } else {
          reject(err);
        }
      } else {
        resolve(result.trim());
      }
    });
  });
}

export function runAsync(cmd: string, cwd = process.cwd()): RunningProcess {
  const cp = exec(cmd, { cwd });
  const timeoutInSeconds = 45;

  return {
    waitEnd() {
      return new Promise<void>((resolve, reject) => {
        cp.on('error', reject);
        cp.on('exit', resolve);
        cp.on('close', resolve);
      });
    },
    waitUntil(condition, error) {
      return new Promise<void>((resolve, reject) => {
        const ref = { timeout: undefined };
        const onData = (data: Buffer) => {
          const line = data.toString();

          if (line.includes(condition)) {
            clearTimeout(ref.timeout);
            cp.stdout.off('data', onData);
            resolve();
          } else if (error && line.includes(error)) {
            clearTimeout(ref.timeout);
            cp.stdout.off('data', onData);
            reject(new Error(`Process encountered an error: ${line}`));
          }
        };
        ref.timeout = setTimeout(() => {
          cp.stdout.off('data', onData);
          reject(new Error(`Process not started after ${timeoutInSeconds}s`));
        }, timeoutInSeconds * 1000);
        cp.stdout.on('data', onData);
      });
    },
    end() {
      cp.kill('SIGTERM');
      cp.stdout.destroy();
      cp.stderr.destroy();
    },
  };
}
