// const path = require('path');
// const { toMatchFilesystemSnapshot } = require('jest-fs-snapshot');
// const {
//   cliVersion,
//   cleanDir,
//   cleanupForSnapshot,
//   getInitializerOptions,
//   execute,
//   snapshotOptions,
// } = require('../src/common');

// const bundlerPrefix = !!process.env.BUNDLER ? process.env.BUNDLER + '-' : '';

// jest.setTimeout(300 * 1000); // 300 second timeout
// expect.extend({ toMatchFilesystemSnapshot });

// describe('piral', () => {
//   it('scaffold piral', async () => {
//     const pathToBuildDir = path.resolve(process.cwd(), bundlerPrefix + 'piral-inst');

//     await cleanDir(pathToBuildDir);

//     const info = await execute(`npm init piral-instance@${cliVersion} ` + getInitializerOptions(), {
//       cwd: pathToBuildDir,
//     });

//     await cleanupForSnapshot(pathToBuildDir);

//     expect(info.stderr).toBe('');
//     expect(pathToBuildDir).toMatchFilesystemSnapshot(undefined, snapshotOptions);
//   });
// });
