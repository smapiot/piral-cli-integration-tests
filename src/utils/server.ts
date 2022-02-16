import { fork } from 'child_process';
import { resolve } from 'path';

export interface ServerRunner {
  start(): Promise<void>;
  stop(): Promise<void>;
  url: string;
  apiKey: string;
}

export function createServer(port: number): ServerRunner {
  const apiKey = Math.random().toString(16).substring(2);
  const path = resolve(__dirname, 'server-proxy.js');
  const cp = fork(path, [], { cwd: process.cwd(), stdio: 'pipe' });

  return {
    start() {
      return new Promise<void>(resolve => {
        cp.once('message', (msg) => {
          if (msg === 'started') {
            resolve();
          }
        });
        cp.send({ type: 'start', port, apiKey });
      });
    },
    stop() {
      return new Promise<void>((resolve) => {
        cp.once('message', (msg) => {
          if (msg === 'stopped') {
            cp.kill();
            resolve();
          }
        });
        cp.send({ type: 'stop' });
      });
    },
    url: `http://localhost:${port}/api/v1/pilet`,
    apiKey,
  };
}
