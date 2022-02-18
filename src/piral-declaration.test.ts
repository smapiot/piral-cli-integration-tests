import { cliVersion, runTests } from './utils';

runTests('piral-declaration', ({ test, setup }) => {
  setup(async (ctx) => {
    await ctx.run(`npx --package piral-cli@${cliVersion} piral new --bundler none`);
  });

  test('declaration-standard-template', 'declaration of the standard template should work', [], async (ctx) => {
    const result = await ctx.run(`npx piral declaration`);

    ctx.assertFiles({
      'dist/index.d.ts'(content: string) {
        expect(content).not.toBe('');
      },
    });
  });
});
