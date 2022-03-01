import { cliVersion, npmInit, runTests, selectedBundler } from './utils';

runTests('piral-build', ({ test, setup }) => {
  setup(async (ctx) => {
    await ctx.run(`npx --package piral-cli@${cliVersion} piral new --bundler none`);
    await ctx.run(`npm i ${selectedBundler} --save-dev`);
    await ctx.run(`npm i emojis-list@3.0.0`);
  });

  // 'release-standard-template',
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

  // 'emulator-standard-template',
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

  // 'can produce emulator sources build',
  test(
    'emulator-sources-standard-template',
    'can produce emulator sources build',
    ['build.piral'],
    async (ctx) => {
      await ctx.run(`npx piral build --type emulator-sources`);

      await ctx.assertFiles({
        'package-lock.json': true,
        'package.json'(content: string) {
          expect(content).toContain('"pilets": {');
        },
        'node_modules/piral-cli/package.json': true,
        'emulator/package.json': true,
        'emulator/app/index.html'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('<title>My Piral Instance</title>')
          expect(content).toContain('<script defer src="/index.b68111.js"></script>')
        }
      });
    },
  );

  // 'can scaffold from the emulator',
  test(
    'emulator-scaffold',
    'can scaffold from the emulator',
    ['#empty'],
    async (ctx) => {
      const source = ctx.getRef('emulator');

      await ctx.run(npmInit(`pilet@${cliVersion}`, `--source ${source} --bundler none --defaults`));

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
