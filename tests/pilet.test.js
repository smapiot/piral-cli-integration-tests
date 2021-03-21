const path = require('path');
const { spawn, exec } = require('child_process');
const kill = require('tree-kill');
const http = require('http');

const { toMatchFilesystemSnapshot } = require('jest-fs-snapshot');
const { cleanDir, cleanupForSnapshot, snapshotOptions, execute, sleep } = require('../src/common');

const cliVersion = process.env.CLI_VERSION || 'latest';
const installFlag = process.version.startsWith('v15') ? '-y --legacy-peer-deps -- ' : '';

jest.setTimeout(300 * 1000); // 300 second timeout
expect.extend({ toMatchFilesystemSnapshot });

describe('pilet', () => {
  it('scaffold pilet', async () => {
    const pathToBuildDir = path.resolve(process.cwd(), 'pilet-build');
    await cleanDir(pathToBuildDir);

    const info = await execute(`npm init pilet@${cliVersion} ${installFlag} -y`, {
      cwd: pathToBuildDir,
    });

    await cleanupForSnapshot(pathToBuildDir);

    expect(info.stderr).toBe('');

    expect(pathToBuildDir).toMatchFilesystemSnapshot(undefined, snapshotOptions);
  });

  it('pilet scaffold with piral source', async () => {
    const pathToBuildDir = path.resolve(process.cwd(), 'pilet');
    await cleanDir(pathToBuildDir);

    // scaffold new pilet
    const info = await execute(`npm init pilet@${cliVersion} ${installFlag}--source sample-piral@${cliVersion} -y`, {
      cwd: pathToBuildDir,
    });
    expect(info.stderr).toBe('');
  });

  it('pilet publish', async (done) => {
    const pathToBuildDir = path.resolve(process.cwd(), 'pilet');
    const port = 9000;
    const testFeedUrl = `http://localhost:${port}/api/v1/pilet`;
    const testFeedKey = 'df133a512569cbc85f69788d1b7ff5a909f6bcfe1c9a2794283a2fc35175882c';

    const localFeedService = spawn(`npm run sample-feed`, {
      cwd: process.cwd(),
      shell: true,
    });

    await sleep(5000); //wait for feed service to come up. TODO: Replace with waitForRunning function (src/pilet.js)

    const publish = new Promise((res, rej) => {
      exec(
        `npx pilet publish --fresh --url ${testFeedUrl} --api-key ${testFeedKey}`,
        {
          cwd: pathToBuildDir,
        },
        (error, stdout, stderr) => {
          if (error) rej({ error, stdout, stderr });
          else res({ stdout, stderr });
        },
      );
    });

    let publishOutput;

    await publish
      .then((success) => {
        publishOutput = success.stdout.toString();
      })
      .catch((err) => expect(false));

    const pilets = await new Promise((resolve) => {
      const options = {
        host: `localhost`,
        port: port,
        path: '/api/v1/pilet',
        headers: {
          Authorization: testFeedKey,
        },
      };

      http
        .request(options, (response) => {
          let str = '';

          response.on('data', (chunk) => {
            str += chunk;
          });

          response.on('end', () => {
            const asJson = JSON.parse(str);
            resolve(asJson);
          });
        })
        .end();
    });

    expect(publishOutput).not.toMatch(/\[[0-9]+\]\s+Failed/gm);
    expect(pilets.items.length).toBe(1);

    kill(localFeedService.pid);
    done();
  });
});
