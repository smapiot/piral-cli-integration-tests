import { cliVersion, runTests } from './utils';

runTests('pilet-new', ({ test }) => {
  test(
    'from-cli-full',
    'can create a new TS pilet with modules using `sample-piral` from cli in the same directory',
    [],
    async (ctx) => {
      await ctx.run(`npx --package piral-cli@${cliVersion} pilet new sample-piral@${cliVersion}`);

      await ctx.assertFiles({
        'package.json'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('"sample-piral"');
          expect(content).toContain('"piral-cli"');
          expect(content).toContain(`"${ctx.id}"`);
          return true;
        },
        'tsconfig.json': true,
        'node_modules/react/package.json': true,
        'src/index.tsx'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain("import { PiletApi } from 'sample-piral';");
          expect(content).toContain('export function setup(app: PiletApi) {');
          return true;
        },
      });
    },
  );

  test(
    'from-cli-moved',
    'can create a new TS pilet with modules using `sample-piral` from cli in a new directory',
    [],
    async (ctx) => {
      await ctx.run(`npx --package piral-cli@${cliVersion} pilet new sample-piral@${cliVersion} --base foo-pilet`);

      await ctx.assertFiles({
        'foo-pilet/package.json'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('"sample-piral"');
          expect(content).toContain('"piral-cli"');
          expect(content).toContain(`"foo-pilet"`);
          return true;
        },
        'foo-pilet/tsconfig.json': true,
        'foo-pilet/node_modules/react/package.json': true,
        'foo-pilet/src/index.tsx'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain("import { PiletApi } from 'sample-piral';");
          expect(content).toContain('export function setup(app: PiletApi) {');
          return true;
        },
      });
    },
  );

  test(
    'from-cli-init',
    'can create a new JS pilet without installation using `sample-piral` from cli',
    [],
    async (ctx) => {
      await ctx.run(
        `npx --package piral-cli@${cliVersion} pilet new sample-piral@${cliVersion} --no-install --language js`,
      );

      await ctx.assertFiles({
        'package.json'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('"sample-piral"');
          expect(content).toContain('"piral-cli"');
          expect(content).toContain(`"${ctx.id}"`);
          return true;
        },
        'tsconfig.json': false,
        'node_modules/react/package.json': false,
        'src/index.jsx'(content: string) {
          expect(content).not.toBe('');
          expect(content).not.toContain("import { PiletApi } from 'sample-piral';");
          expect(content).toContain('export function setup(app) {');
          return true;
        },
      });
    },
  );

  test(
    'from-initializer-full',
    'can create a new TS pilet with modules using `sample-piral` from npm initializer',
    [],
    async (ctx) => {
      await ctx.run(`npm init pilet@${cliVersion} --source sample-piral@${cliVersion} --defaults`);

      await ctx.assertFiles({
        'package.json'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('"sample-piral"');
          expect(content).toContain('"piral-cli"');
          expect(content).toContain(`"${ctx.id}"`);
          return true;
        },
        'tsconfig.json': true,
        'node_modules/react/package.json': true,
        'src/index.tsx'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain("import { PiletApi } from 'sample-piral';");
          expect(content).toContain('export function setup(app: PiletApi) {');
          return true;
        },
      });
    },
  );
});
