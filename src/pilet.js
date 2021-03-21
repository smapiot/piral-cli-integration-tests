const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

const { toMatchFilesystemSnapshot } = require('jest-fs-snapshot');
const {
  cleanDir,
  waitForRunning,
  timeoutCommand,
  execute,
  sleep,
  isNodeV15,
  getInitializerOptions,
  snapshotOptions,
  cleanupForSnapshot,
} = require('./common');

const fsPromises = fs.promises;

module.exports = ({ jest, expect, describe, it, afterAllHandlers }, cliVersion, bundler, port) => {
  const bundlerPrefix = !!bundler ? bundler + '-' : '';
  const installFlag = process.version.startsWith('v15') ? '-y --legacy-peer-deps -- ' : '';

  jest.setTimeout(300 * 1000); // 300 second timeout
  expect.extend({ toMatchFilesystemSnapshot });

  describe(`${bundlerPrefix}pilet`, () => {
    it('build', async () => {
      const pathToBuildDir = path.resolve(process.cwd(), bundlerPrefix + 'bundler-pilet-build');

      await cleanDir(pathToBuildDir);

      await execute(
        `npm init pilet@${cliVersion} ${installFlag}--source sample-piral@${cliVersion} --name ${'bundler-pilet-build'} -y`,
        {
          cwd: pathToBuildDir,
        },
      );

      await execute(`npm run build`, {
        cwd: pathToBuildDir,
      });

      await cleanupForSnapshot(pathToBuildDir);

      expect(pathToBuildDir).toMatchFilesystemSnapshot(undefined, snapshotOptions);
    });
    it('HMR', async (done) => {
      const pathToBuildDir = path.resolve(process.cwd(), bundlerPrefix + 'pilet');
      const srcFilePath = path.resolve(pathToBuildDir, 'src', 'index.tsx');

      await cleanDir(pathToBuildDir);
      await execute(`npm init pilet@${cliVersion} ${installFlag}--source sample-piral@${cliVersion} -y`, {
        cwd: pathToBuildDir,
      });

      // fixing node15 issue
      if (isNodeV15)
        try {
          await execute(`timeout 60s npx pilet debug --port 2323`, {
            cwd: pathToBuildDir,
          });
        } catch (error) {}

      // start the debug process and wait until compiled and server running
      const debugProcess = spawn(`${timeoutCommand} npx pilet debug --port ${port}`, {
        cwd: pathToBuildDir,
        shell: true,
      });
      afterAllHandlers.push(() => {
        debugProcess.kill('SIGTERM');
        debugProcess.stdout.destroy();
        debugProcess.stderr.destroy();
      });

      const handleError = jest.fn();
      debugProcess.stderr.once('data', handleError);
      await waitForRunning(debugProcess, port);

      // Go to page and check for expected pilet
      await page.goto(`http://localhost:${port}`, { waitUntil: 'networkidle0' });
      let innerHtml = await page.$eval('.pi-tile', (element) => {
        return element.children[0].innerHTML;
      });
      expect(innerHtml).toBe('Welcome to Piral!');

      // Will be resolved 1s after the dev server has recompiled the changes
      const backendReloaded = new Promise((resolve, reject) => {
        timeout = setTimeout(() => reject(new Error('Server not started after 60s')), 60 * 1000);
        debugProcess.stdout.once('data', () => {
          clearTimeout(timeout);
          resolve();
        });
      }).then(() => sleep(1000));

      // Update in src/index.tsx to trigger HMR
      const newString = `Welcome to Test${Math.floor(Math.random() * 10000)}!`;
      const indexFile = await fsPromises.readFile(srcFilePath);
      await fsPromises.writeFile(srcFilePath, indexFile.toString().replace('Welcome to Piral!', newString));

      // Wait until changes have been applied and check the updated pilet
      await backendReloaded;
      innerHtml = await page.$eval('.pi-tile', (element) => {
        return element.children[0].innerHTML;
      });
      expect(innerHtml).toBe(newString);

      // Validate, that the debug process did not output any errors and terminate the process
      expect(handleError).not.toBeCalled();
      debugProcess.kill('SIGTERM');
      debugProcess.stdout.destroy();
      debugProcess.stderr.destroy();

      done();
    });
  });
};
