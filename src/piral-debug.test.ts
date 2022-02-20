import { cliVersion, getFreePort, runTests, selectedBundler } from './utils';

runTests('piral-debug', ({ test, setup }) => {
  setup(async (ctx) => {
    await ctx.run(`npx --package piral-cli@${cliVersion} piral new --bundler none`);
    await ctx.run(`npm i ${selectedBundler} --save-dev`);
  });

  test('debug-standard-template', 'can produce a debug build', ['codegen', 'debug.piral'], async (ctx) => {
    const port = await getFreePort(1235);
    const cp = ctx.runAsync(`npx piral debug --port ${port}`);

    await cp.waitUntil('Ready');

    await page.goto(`http://localhost:${port}`);

    await expect(page).toHaveSelectorCount('.tile', 5);

    const dependencies = await page.evaluate(() => {
      //@ts-ignore
      return Object.keys(System.registerRegistry);
    });

    expect(dependencies).not.toHaveLength(0);
    expect(dependencies).toContain('tslib');
    expect(dependencies).toContain('react');
  });

  test('hmr-standard-template', 'can hmr when developing a debug build', ['codegen', 'debug.piral', 'hmr'], async (ctx) => {
    const port = await getFreePort(1236);
    const cp = ctx.runAsync(`npx piral debug --port ${port}`);

    await cp.waitUntil('Ready');

    await page.goto(`http://localhost:${port}`);

    await ctx.setFiles({
      'src/index.tsx'(content: string) {
        return content.replace(
          "'https://feed.piral.cloud/api/v1/pilet/empty'",
          "'https://feed.piral.cloud/api/v1/pilet/sample'",
        );
      },
    });

    await page.waitForSelector('.mario-tile');

    await expect(page).not.toHaveSelectorCount('.tile', 5);
  });
});
