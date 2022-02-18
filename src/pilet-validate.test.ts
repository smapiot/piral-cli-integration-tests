import { cliVersion, runTests } from './utils';

runTests('pilet-validate', ({ test, setup }) => {
  setup(async (ctx) => {
    await ctx.run(`npx --package piral-cli@${cliVersion} pilet new sample-piral@latest --bundler none`);
  });

  test(
    'validate-standard-template',
    'standard template should be valid',
    [],
    async (ctx) => {
      const result = await ctx.run(`npx pilet validate`);

      expect(result).toContain('Validation successful. No errors or warnings.');
    },
  );

  test(
    'validate-outdated-app-shell',
    'outdated app shell should yield warning',
    [],
    async (ctx) => {
      await ctx.run('npm i sample-piral@0.14.3');

      const result = await ctx.run(`npx pilet validate`);

      expect(result).toContain('Validation succeeded with 1 warning(s)');
    },
  );
});
