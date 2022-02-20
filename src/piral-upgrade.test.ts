import { cliVersion, npmInit, runTests } from './utils';

runTests('piral-upgrade', ({ test }) => {
  test('from-0140', 'can upgrade from 0.14.0 to current version', [], async (ctx) => {
    const original = '0.14.0';

    await ctx.run(npmInit(`piral-instance@next`, `--tag ${original} --bundler none --defaults`));

    await ctx.assertFiles({
      'package.json'(content: string) {
        const packageJson = JSON.parse(content);
        expect(packageJson.dependencies).toHaveProperty('piral', original);
        expect(packageJson.devDependencies).toHaveProperty('piral-cli', original);
      },
    });

    await ctx.run(`npx piral upgrade ${cliVersion}`);

    const version = await ctx.run(`npm view piral@${cliVersion} version`);

    await ctx.assertFiles({
      'package.json'(content: string) {
        const packageJson = JSON.parse(content);
        expect(packageJson.dependencies).toHaveProperty('piral', version);
        expect(packageJson.devDependencies).toHaveProperty('piral-cli', version);
      },
    });
  });
});
