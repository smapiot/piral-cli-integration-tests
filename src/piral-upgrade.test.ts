import { cliVersion, npmInit, runTests } from './utils';

runTests('piral-upgrade', ({ test }) => {
  test('from-0140', 'can upgrade from 0.14.0 to current version', [], async (ctx) => {
    await ctx.run(npmInit('piral-instance@0.14.0', '--tag 0.14.0 --bundler none --defaults'));

    await ctx.assertFiles({
      'package.json'(content: string) {
        const packageJson = JSON.parse(content);
        expect(packageJson.dependencies).toHaveProperty('piral', '^0.14.0');
        expect(packageJson.devDependencies).toHaveProperty('piral-cli', '0.14.0');
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
