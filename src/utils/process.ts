import { exec } from 'child_process';
import { platform } from 'os';
import { promisify } from 'util';
import { RunningProcess } from './types';

const isWindows = platform() === 'win32';

export const execAsync = promisify(exec);

export const sleep = promisify(setTimeout);

export function run(cmd: string, cwd = process.cwd()) {
  return new Promise<string>((resolve, reject) => {
    const { NODE_ENV, ...env } = process.env;
    exec(cmd, { cwd, env }, (err, stdout = '', stderr = '') => {
      const result = stdout + stderr;

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
  const { NODE_ENV, ...env } = process.env;
  const cp = exec(cmd, { cwd, env });
  const timeoutInSeconds = 45;
  const waitEnd = () => {
    if (!cp.killed) {
      return new Promise<void>((resolve, reject) => {
        cp.on('error', reject);
        cp.on('exit', resolve);
        cp.on('close', resolve);
      });
    }

    return Promise.resolve();
  };

  return {
    waitEnd,
    waitUntil(condition, error) {
      return new Promise<void>((resolve, reject) => {
        const ref = { timeout: undefined };
        const onData = (data: Buffer) => {
          const line = data.toString();

          if (line.includes(condition)) {
            clearTimeout(ref.timeout);
            cp.stdout.off('data', onData);
            cp.stderr.off('data', onData);
            resolve();
          } else if (error && line.includes(error)) {
            clearTimeout(ref.timeout);
            cp.stdout.off('data', onData);
            cp.stderr.off('data', onData);
            reject(new Error(`Process encountered an error: ${line}`));
          }
        };
        ref.timeout = setTimeout(() => {
          cp.stdout.off('data', onData);
          cp.stderr.off('data', onData);
          reject(new Error(`Process not started after ${timeoutInSeconds}s`));
        }, timeoutInSeconds * 1000);
        cp.stdout.on('data', onData);
        cp.stderr.on('data', onData);
      });
    },
    end() {
      const promise = waitEnd();
      cp.kill('SIGTERM');

      try {
        // might not work on Windows (EPERM)
        cp.kill('SIGKILL');
      } catch (err) {
        console.warn(err);
      }

      if (!isWindows) {
        // does not work on Windows
        cp.kill('SIGQUIT');
      }

      cp.stdout.destroy();
      cp.stderr.destroy();
      return promise;
    },
  };
}
