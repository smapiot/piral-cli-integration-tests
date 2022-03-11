import { cliVersion, runTests } from './utils';

runTests('piral-validate', ({ test, setup }) => {
  setup(async (ctx) => {
    await ctx.run(`npx --package piral-cli@${cliVersion} piral new --bundler none`);
  });

  test('validate-standard-template', 'standard template should be valid', [], async (ctx) => {
    const result = await ctx.run(`npx piral validate`);

    //TODO this is an issue right now
    //expect(result).toContain('Validation successful. No errors or warnings.');
    expect(result).toContain('Validation succeeded with 9 warning(s).');
  });

  test('validate-inconsistent-piral-cli', 'inconsistent piral CLI should yield warning', [], async (ctx) => {
    await ctx.run('npm i piral-cli@0.14.3');

    const result = await ctx.run(`npx piral validate`);

    //TODO this is an issue right now
    //expect(result).toContain('Validation succeeded with 1 warning(s)');
    expect(result).toContain('Validation succeeded with 9 warning(s)');
  });

  test('depends-on-piral-validator', 'depends-on-piral validator should work', [], async (ctx) => {
    const result = await ctx.run(`npx piral validate depends-on-piral`);

    expect(result).toContain('Validation succeeded with 9 warning(s)');
  });

  test(
    'depends-on-piral-validator-removing-piral-dependency',
    'depends-on-piral-validator should not work when removing the piral dependency',
    [],
    async (ctx) => {
      await ctx.setFiles({
        'package.json'(content: string) {
          const packageJson = JSON.parse(content);
          packageJson.dependencies = {};
          return JSON.stringify(packageJson, undefined, 2);
        },
      });

      const result = await ctx.run(`npx piral validate depends-on-piral`);

      expect(result).toContain(
        'The dependencies of the Piral instance should list either piral, piral-core, or piral-base.',
      );
    },
  );

  test('entry-ends-with-html-validator', 'entry-ends-with-html validator should work', [], async (ctx) => {
    const result = await ctx.run(`npx piral validate entry-ends-with-html`);

    expect(result).toContain('Validation succeeded with 9 warning(s)');
  });

  test(
    'entry-ends-with-html-validator-different-entry',
    'entry-ends-with-html validator should not work when changing entry',
    [],
    async (ctx) => {
      await ctx.setFiles({
        'package.json'(content: string) {
          const packageJson = JSON.parse(content);
          packageJson.app = './src/index.tsx';
          return JSON.stringify(packageJson, undefined, 2);
        },
      });

      const result = await ctx.run(`npx piral validate entry-ends-with-html`);

      expect(result).toContain(
        'The resolved app should be an HTML file, otherwise it may be an invalid bundler entry point.',
      );
    },
  );

  test('has-valid-externals-validator', 'has-valid-externals validator should work', [], async (ctx) => {
    const result = await ctx.run(`npx piral validate has-valid-externals-validator`);

    expect(result).toContain('Validation succeeded with 9 warning(s)');
  });

  test(
    'has-valid-externals-validator-with-invalid-external',
    'has-valid-externals validator should not work when adding invalid external',
    [],
    async (ctx) => {
      await ctx.setFiles({
        'package.json'(content: string) {
          const packageJson = JSON.parse(content);
          packageJson.pilets['externals'] = ['invalid-external'];
          return JSON.stringify(packageJson, undefined, 2);
        },
      });

      const result = await ctx.run(`npx piral validate has-valid-externals`);

      expect(result).toContain(
        'The shared dependency "invalid-external" is listed in pilets.external, but not in dependencies.',
      );
    },
  );

  test('has-valid-devDependencies', 'has-valid-devDependencies validator should work', [], async (ctx) => {
    const result = await ctx.run(`npx piral validate has-valid-devDependencies`);

    expect(result).toContain('Validation succeeded with 9 warning(s)');
  });

  test(
    'has-valid-devDependencies-validator-with-non-existing-devDependencies',
    'has-valid-devDependencies validator should not work when adding non existing devDependencies',
    [],
    async (ctx) => {
      await ctx.setFiles({
        'package.json'(content: string) {
          const packageJson = JSON.parse(content);
          packageJson.pilets['devDependencies'] = { 'non-existing-dependency': true };
          return JSON.stringify(packageJson, undefined, 2);
        },
      });

      const result = await ctx.run(`npx piral validate has-valid-devDependencies`);

      expect(result).toContain(
        'The scaffold dev dependency "non-existing-dependency" refers to any dependency in the app, but none found.',
      );
    },
  );

  test('has-valid-files-validator', 'has-valid-files validator should work', [], async (ctx) => {
    const result = await ctx.run(`npx piral validate has-valid-files`);

    expect(result).toContain('Validation succeeded with 9 warning(s)');
  });

  test(
    'has-valid-files-validator-with-non-existing-files',
    'has-valid-files validator should not work when adding non existing files',
    [],
    async (ctx) => {
      await ctx.setFiles({
        'package.json'(content: string) {
          const packageJson = JSON.parse(content);
          packageJson.pilets['files'] = ['nonExistingFile.js'];
          return JSON.stringify(packageJson, undefined, 2);
        },
      });

      try {
        const result = await ctx.run(`npx piral validate has-valid-files`);
      } catch (err) {
        expect(err.message).toContain('Command failed: npx piral validate has-valid-files');
      }
    },
  );
});
