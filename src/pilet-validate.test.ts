import { cliVersion, runTests } from './utils';

runTests('pilet-validate', ({ test, setup }) => {
  setup(async (ctx) => {
    await ctx.run(`npx --package piral-cli@${cliVersion} pilet new sample-piral@latest --bundler none`);
  });

  // test('validate-standard-template', 'standard template should be valid', [], async (ctx) => {
  //   const result = await ctx.run(`npx pilet validate`);

  //   expect(result).toContain('Validation successful. No errors or warnings.');
  // });

  // test('validate-outdated-app-shell', 'outdated app shell should yield warning', [], async (ctx) => {
  //   await ctx.run('npm i sample-piral@0.14.3');

  //   const result = await ctx.run(`npx pilet validate`);

  //   expect(result).toContain('Validation succeeded with 1 warning(s)');
  // });

  // test('outdated-appShell-version', 'outdated appShell version should yield warning', [], async (ctx) => {
  //   let appShellName;
  //   await ctx.assertFiles({
  //     async 'package.json'(content: string) {
  //       const appShell = await JSON.parse(content);
  //       appShellName = appShell.name;
  //     },
  //   });

  //   await ctx.setFiles({
  //     'node_modules/sample-piral/package.json'(content: string) {
  //       const packageJson = JSON.parse(content);
  //       packageJson.name = appShellName;
  //       return JSON.stringify(packageJson, undefined, 2);
  //     },
  //   });

  //   const result = await ctx.run(`npx pilet validate`);

  //   expect(result).toContain(`The used version of \"${appShellName}\" is outdated.`);
  //   expect(result).toContain(`Validation succeeded with 1 warning(s).`);
  // });

  test('bundle-size', 'when the bundle size is over the limit should error out', [], async (ctx) => {
    const length = 25 * 1024; // 50 kB
    const arr = new Array(length);
    for (let i = 0; i < length; i++) {
      arr[i] = (i % 10).toString(); // '0' - '9'
    }
    const str = arr.join('');
    await ctx.setFiles({
      'dist/index.js': `
    export function setup() {
      console.log(${JSON.stringify(str)});
    }
  `,
      'node_modules/sample-piral/package.json'(content: string) {
        const packageJson = JSON.parse(content);
        packageJson.pilets['validators'] = {
          'stays-small': 20,
        };
        return JSON.stringify(packageJson, undefined, 2);
      },
    });

    try {
      await ctx.run(`npx pilet validate`);
      expect(true).toBe(false);
    } catch (err) {
      expect(err).toContain('The main bundle is too large.');
    }
  });

  // test('adding-custom-validator', 'adding custom validator', [], async (ctx) => {
  //   await ctx.setFiles({
  //     'node_modules/piral-cli-myplugin/package.json': JSON.stringify({
  //       name: 'piral-cli-myplugin',
  //       version: '1.0.0',
  //       main: './index.js',
  //     }),
  //     'node_modules/piral-cli-myplugin/index.js': `
  //     module.exports = function(cli) {

  //       cli.withPiletRule('piral-cli-myplugin-rule', (context, options) => {

  //         context.warning("A warning message from the new validator")

  //       })

  //       }
  //     `,
  //     'node_modules/sample-piral/package.json'(content: string) {
  //       const packageJson = JSON.parse(content);
  //       packageJson.pilets['validators'] = {
  //         'piral-cli-myplugin-rule': 'active',
  //       };
  //       return JSON.stringify(packageJson, undefined, 2);
  //     },
  //   });

  //   const result = await ctx.run(`npx pilet validate`);

  //   expect(result).toContain(`Validation succeeded with 1 warning(s).`);
  // });
});
