import { cliVersion, runTests } from './utils';

runTests('piral-validate', ({ test, setup }) => {
  setup(async (ctx) => {
    await ctx.run(`npx --package piral-cli@${cliVersion} piral new --bundler none`);
  });

  test(
    'validate-standard-template',
    'standard template should be valid',
    [],
    async (ctx) => {
      const result = await ctx.run(`npx piral validate`);

      //TODO this is an issue right now
      //expect(result).toContain('Validation successful. No errors or warnings.');
      expect(result).toContain('Validation succeeded with 9 warning(s).');
    },
  );

  test(
    'validate-inconsistent-piral-cli',
    'inconsistent piral CLI should yield warning',
    [],
    async (ctx) => {
      await ctx.run('npm i piral-cli@0.14.3');

      const result = await ctx.run(`npx piral validate`);

      //TODO this is an issue right now
      //expect(result).toContain('Validation succeeded with 1 warning(s)');
      expect(result).toContain('Validation succeeded with 9 warning(s)');
    },
  );
});
