import { cliVersion, runTests, selectedBundler, getFreePort } from './utils';

runTests('pilet-debug', ({ test, setup }) => {
  setup(async (ctx) => {
    await ctx.run(`npx --package piral-cli@${cliVersion} pilet new sample-piral@${cliVersion} --bundler none`);
    await ctx.run(`npm i ${selectedBundler} --save-dev`);
    await ctx.run(`npm i emojis-list@3.0.0`);
  });

  test('debug-standard-template', 'can produce a debug build', ['debug.pilet'], async (ctx) => {
    const port = await getFreePort(1256);
    const cp = ctx.runAsync(`npx pilet debug --port ${port}`);

    await cp.waitUntil('Ready', 'The bundling process failed');

    await page.goto(`http://localhost:${port}`);

    await expect(page).toHaveSelectorCount('.pi-tile', 1);

    await expect(page).toMatchText('.pi-tile', 'Welcome to Piral!');
  });

  test('reload-standard-template', 'can reload when developing a debug build', ['debug.pilet'], async (ctx) => {
    const port = await getFreePort(1257);
    const cp = ctx.runAsync(`npx pilet debug --port ${port}`);

    await cp.waitUntil('Ready', 'The bundling process failed');

    await page.goto(`http://localhost:${port}`);

    await ctx.setFiles({
      'src/index.tsx'(content: string) {
        return content.replace('<div>Welcome to Piral!</div>', "<div className='foobar'>Welcome to Foo...</div>");
      },
    });

    await page.waitForSelector('.foobar');

    await expect(page).toHaveSelectorCount('.pi-tile', 1);

    await expect(page).toMatchText('.pi-tile', 'Welcome to Foo...');
  });
});
