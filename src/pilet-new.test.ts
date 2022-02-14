import { cliVersion, prepareTests, run, TestEnvironment } from './utils';

let testEnv: TestEnvironment;

describe('pilet-new', () => {
  beforeAll(async () => {
    testEnv = await prepareTests('pilet-new');
  });

  it('can create a new TS pilet with modules using `sample-piral` from cli', async () => {
    const ctx = await testEnv.createTestContext('from-cli-full');

    await run(`npx --package piral-cli@${cliVersion} pilet new sample-piral@${cliVersion}`, ctx.root);

    await ctx.assertFiles({
      'package.json'(content) {
        expect(content).not.toBe('');
        expect(content).toContain('"sample-piral"');
        expect(content).toContain('"piral-cli"');
        expect(content).toContain('"from-cli-full_');
        return true;
      },
      'tsconfig.json': true,
      'node_modules/react/package.json': true,
      'src/index.tsx'(content) {
        expect(content).not.toBe('');
        expect(content).toContain("import { PiletApi } from 'sample-piral';");
        expect(content).toContain("export function setup(app: PiletApi) {");
        return true;
      },
    });
  });

  it('can create a new JS pilet without installation using `sample-piral` from cli', async () => {
    const ctx = await testEnv.createTestContext('from-cli-init');

    await run(`npx --package piral-cli@${cliVersion} pilet new sample-piral@${cliVersion} --no-install --language js`, ctx.root);

    await ctx.assertFiles({
      'package.json'(content) {
        expect(content).not.toBe('');
        expect(content).toContain('"sample-piral"');
        expect(content).toContain('"piral-cli"');
        expect(content).toContain('"from-cli-init_');
        return true;
      },
      'tsconfig.json': false,
      'node_modules/react/package.json': false,
      'src/index.jsx'(content) {
        expect(content).not.toBe('');
        expect(content).not.toContain("import { PiletApi } from 'sample-piral';");
        expect(content).toContain("export function setup(app) {");
        return true;
      },
    });
  });
});
