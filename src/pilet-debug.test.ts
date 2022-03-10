import axios from 'axios';
import { cliVersion, runTests, selectedBundler, getFreePort } from './utils';

runTests('pilet-debug', ({ test, setup }) => {
  setup(async (ctx) => {
    await ctx.run(`npx --package piral-cli@${cliVersion} pilet new sample-piral@${cliVersion} --bundler none`);
    await ctx.run(`npm i ${selectedBundler} --save-dev`);
    await ctx.run(`npm i emojis-list@3.0.0`);
  });

  // test('debug-standard-template', 'can produce a debug build', ['debug.pilet'], async (ctx) => {
  //   const port = await getFreePort(1256);
  //   const cp = ctx.runAsync(`npx pilet debug --port ${port}`);

  //   await cp.waitUntil('Ready', 'The bundling process failed');

  //   await page.goto(`http://localhost:${port}`);

  //   await expect(page).toHaveSelectorCount('.pi-tile', 1);

  //   await expect(page).toMatchText('.pi-tile', 'Welcome to Piral!');
  // });

  // test('reload-standard-template', 'can reload when developing a debug build', ['debug.pilet'], async (ctx) => {
  //   const port = await getFreePort(1257);
  //   const cp = ctx.runAsync(`npx pilet debug --port ${port}`);

  //   await cp.waitUntil('Ready', 'The bundling process failed');

  //   await page.goto(`http://localhost:${port}`);

  //   await ctx.setFiles({
  //     'src/index.tsx'(content: string) {
  //       return content.replace('<div>Welcome to Piral!</div>', "<div className='foobar'>Welcome to Foo...</div>");
  //     },
  //   });

  //   await page.waitForSelector('.foobar');

  //   await expect(page).toHaveSelectorCount('.pi-tile', 1);

  //   await expect(page).toMatchText('.pi-tile', 'Welcome to Foo...');
  // });

  // test(
  //   'debug-standard-template-with-schema-v0',
  //   'can produce a debug build with schema v0',
  //   ['debug.pilet'],
  //   async (ctx) => {
  //     const port = await getFreePort(1256);
  //     const cp = ctx.runAsync(`npx pilet debug --port ${port} --schema v0`);

  //     await cp.waitUntil('Ready', 'The bundling process failed');

  //     await page.goto(`http://localhost:${port}`);

  //     const res = await axios.get(`http://localhost:${port}/$pilet-api`);
  //     const pilets = res.data;

  //     expect(pilets).toEqual({
  //       name: expect.anything(),
  //       version: expect.anything(),
  //       link: expect.anything(),
  //       spec: 'v0',
  //       hash: expect.anything(),
  //       noCache: expect.anything(),
  //     });

  //     await expect(page).toHaveSelectorCount('.pi-tile', 1);

  //     await expect(page).toMatchText('.pi-tile', 'Welcome to Piral!');
  //   },
  // );

  // test(
  //   'debug-standard-template-with-schema-v1',
  //   'can produce a debug build with schema v1',
  //   ['debug.pilet'],
  //   async (ctx) => {
  //     const port = await getFreePort(1256);
  //     const cp = ctx.runAsync(`npx pilet debug --port ${port} --schema v1`);

  //     await cp.waitUntil('Ready', 'The bundling process failed');

  //     await page.goto(`http://localhost:${port}`);

  //     const res = await axios.get(`http://localhost:${port}/$pilet-api`);
  //     const pilets = res.data;

  //     expect(pilets).toEqual({
  //       name: expect.anything(),
  //       version: expect.anything(),
  //       link: expect.anything(),
  //       spec: 'v1',
  //       requireRef: expect.anything(),
  //       integrity: expect.anything(),
  //     });

  //     await expect(page).toHaveSelectorCount('.pi-tile', 1);

  //     await expect(page).toMatchText('.pi-tile', 'Welcome to Piral!');
  //   },
  // );

  // test(
  //   'debug-standard-template-with-default-schema-v2',
  //   'can produce a debug build with default schema v2',
  //   ['debug.pilet'],
  //   async (ctx) => {
  //     const port = await getFreePort(1256);
  //     const cp = ctx.runAsync(`npx pilet debug --port ${port} --schema`);

  //     await cp.waitUntil('Ready', 'The bundling process failed');

  //     await page.goto(`http://localhost:${port}`);

  //     const res = await axios.get(`http://localhost:${port}/$pilet-api`);
  //     const pilets = res.data;

  //     expect(pilets).toEqual({
  //       name: expect.anything(),
  //       version: expect.anything(),
  //       link: expect.anything(),
  //       spec: 'v2',
  //       requireRef: expect.anything(),
  //       dependencies: expect.anything(),
  //     });

  //     await expect(page).toHaveSelectorCount('.pi-tile', 1);

  //     await expect(page).toMatchText('.pi-tile', 'Welcome to Piral!');
  //   },
  // );

  // test(
  //   'debug-standard-template-with-none-schema',
  //   'can produce a debug build with none schema',
  //   ['debug.pilet'],
  //   async (ctx) => {
  //     const port = await getFreePort(1256);
  //     const cp = ctx.runAsync(`npx pilet debug --port ${port} --schema none`);

  //     await cp.waitUntil('Ready', 'The bundling process failed');

  //     await page.goto(`http://localhost:${port}`);

  //     const res = await axios.get(`http://localhost:${port}/$pilet-api`);
  //     const pilets = res.data;

  //     expect(pilets).toEqual({
  //       name: expect.anything(),
  //       version: expect.anything(),
  //       link: expect.anything(),
  //       spec: 'v0',
  //       hash: expect.anything(),
  //       noCache: expect.anything(),
  //     });

  //     await expect(page).not.toHaveSelectorCount('.pi-tile', 1);

  //     await expect(page).not.toMatchText('.pi-tile', 'Welcome to Piral!');
  //   },
  // );

  // test(
  //   'debug-standard-template-with-an-external-feed',
  //   'can produce a debug build with an external feed',
  //   ['debug.pilet'],
  //   async (ctx) => {
  //     const port = await getFreePort(1256);
  //     const cp = ctx.runAsync(`npx pilet debug --port ${port} --feed "https://feed.piral.cloud/api/v1/pilet/sample"`);

  //     await cp.waitUntil('Ready', 'The bundling process failed');

  //     await page.goto(`http://localhost:${port}`);

  //     await expect(page).toHaveSelectorCount('.mario-tile', 1);
  //     await expect(page).toHaveSelectorCount('.spaceshoot-tile', 1);

  //     await expect(page).toMatchText('.mario-tile', 'Mario5');
  //     await expect(page).toMatchText('.spaceshoot-tile', 'Spaceshoot');
  //   },
  // );

  test(
    'debug-standard-template-with-different-app-shell',
    'can produce a debug build with different app shell',
    ['debug.pilet'],
    async (ctx) => {
      await ctx.run(`npm i netflix-piral`);

      await ctx.setFiles({
        'src/index.tsx'(content: string) {
          content = `import * as React from 'react';
import { PiletApi } from 'sample-piral';

export function setup(app: PiletApi) {
  app.showNotification('Hello from Piral!', {
    autoClose: 2000,
  });
  app.registerMenu(() =>
    <a href="https://docs.piral.io" target="_blank">Documentation</a>
  );
}`;
          return content;
        },
      });

      const port = await getFreePort(1256);
      const cp = ctx.runAsync(`npx pilet debug --port ${port} --app netflix-piral`);

      await cp.waitUntil('Ready', 'The bundling process failed');

      await page.goto(`http://localhost:${port}`);

      await expect(page).toHaveSelectorCount('.text-lightgray', 4);
      await expect(page).toHaveSelectorCount('.error', 1);

      await expect(page).toMatchText('.text-lightgray', 'Made with');
      await expect(page).toMatchText('.error', 'Could not find the requested page. Are you sure it exists?');
    },
  );
});
