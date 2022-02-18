import { cliVersion, runTests, selectedBundler } from './utils';

runTests('piral-build', ({ test, setup }) => {
  setup(async (ctx) => {
    await ctx.run(`npx --package piral-cli@${cliVersion} piral new --bundler none`);
    await ctx.run(`npm i ${selectedBundler} --save-dev`);
    await ctx.run(`npm i emojis-list@3.0.0`);
  });

  test(
    'release-standard-template',
    'can produce a release build',
    ['build.piral'],
    async (ctx) => {
      await ctx.run(`npx piral build --type release`);

      await ctx.assertFiles({
        'dist/release/index.html'(content: string) {
          expect(content).not.toBe('');
        },
      });
    },
  );

  test(
    'emulator-standard-template',
    'can produce an emulator build',
    ['build.piral'],
    async (ctx) => {
      await ctx.setFiles({
        'package.json'(content: string) {
          const packageJson = JSON.parse(content);
          packageJson.name = 'app-shell';
          return JSON.stringify(packageJson, undefined, 2);
        },
      });

      await ctx.run(`npx piral build --type emulator`);

      await ctx.assertFiles({
        'dist/emulator/*.tgz'(files: Array<string>) {
          expect(files).toHaveLength(1);
          ctx.setRef('emulator', files[0]);
        },
      });
    },
  );

  test(
    'emulator-scaffold',
    'can scaffold from the emulator',
    ['#empty'],
    async (ctx) => {
      const source = ctx.getRef('emulator');

      await ctx.run(`npm init pilet@${cliVersion} --source ${source} --bundler none --defaults`);

      await ctx.assertFiles({
        'package.json'(content: string) {
          const packageJson = JSON.parse(content);
          const appShell = packageJson.piral.name;
          expect(appShell).toBe('app-shell');
        },
        'node_modules/app-shell/package.json': true,
        'node_modules/app-shell/app/index.html': true,
      });
    },
  );
});
