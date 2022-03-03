import { cliVersion, npmInit, runTests } from './utils';

runTests('pilet-new', ({ test }) => {
  test(
    'from-cli-empty-template-language-js',
    'can create a new JS pilet without modules using empty template from cli in the same directory',
    [],
    async (ctx) => {
      await ctx.run(
        `npx --package piral-cli@${cliVersion} pilet new sample-piral@${cliVersion} --no-install --template empty --language js`,
      );

      await ctx.assertFiles({
        'package.json'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('"sample-piral"');
          expect(content).toContain('"piral": {');
          expect(content).toContain('"piral-cli"');
          expect(content).toContain(`"${ctx.id}"`);
        },
        'tsconfig.json': false,
        'node_modules/react/package.json': false,
        'src/index.jsx'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain("import * as React from 'react';");
          expect(content).toContain('export function setup(app) {}');
        },
      });
    },
  );

  test(
    'from-cli-empty-template',
    'can create a new TS pilet with modules using empty template from cli in the same directory',
    [],
    async (ctx) => {
      await ctx.run(
        `npx --package piral-cli@${cliVersion} pilet new sample-piral@${cliVersion} --no-install --template empty`,
      );

      await ctx.assertFiles({
        'package.json'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('"sample-piral"');
          expect(content).toContain('"piral-cli"');
          expect(content).toContain(`"${ctx.id}"`);
        },
        'tsconfig.json': true,
        'node_modules/react/package.json': false,
        'src/index.tsx'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain("import { PiletApi } from 'sample-piral';");
          expect(content).toContain('export function setup(app: PiletApi) {}');
        },
      });
    },
  );

  test(
    'from-cli-invalid-template',
    'can not create a new TS pilet without modules using invalid template from cli in the same directory',
    [],
    async (ctx) => {
      try {
        await ctx.run(
          `npx --package piral-cli@${cliVersion} pilet new sample-piral@${cliVersion} --no-install --template some-invalid-template-foo`,
        );
      } catch {}

      await ctx.assertFiles({
        'package.json': true,
        'src/index.tsx': false,
        'tsconfig.json': false,
        'node_modules/piral-cli/package.json': false,
      });
    },
  );

  test(
    'from-cli-default-registry',
    'can create a new TS pilet with the default registry from cli in the same directory',
    [],
    async (ctx) => {
      await ctx.run(
        `npx --package piral-cli@${cliVersion} pilet new sample-piral@${cliVersion} --registry https://registry.npmjs.org/`,
      );

      await ctx.assertFiles({
        'package.json'(content) {
          expect(content).not.toBe('');
          expect(content).toContain('"typescript"');
          expect(content).toContain('"piral": {');
          expect(content).toContain('"piral-cli"');
        },
        '.npmrc': false,
        'tsconfig.json': true,
        'node_modules/piral-cli/package.json': true,
        'src/index.tsx'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain("import { PiletApi } from 'sample-piral';");
        },
      });
    },
  );

  test(
    'from-cli-custom-registry',
    'can create a new TS pilet with a custom registry from cli in a new directory',
    [],
    async (ctx) => {
      await ctx.run(
        `npx --package piral-cli@${cliVersion} pilet new sample-piral@${cliVersion} --registry https://registry.npmmirror.com/`,
      );

      await ctx.assertFiles({
        'package.json'(content) {
          expect(content).not.toBe('');
          expect(content).toContain('"typescript"');
          expect(content).toContain('"piral": {');
          expect(content).toContain('"piral-cli"');
        },
        '.npmrc'(content) {
          expect(content).toContain('registry=https://registry.npmmirror.com/');
        },
        'tsconfig.json': true,
        'node_modules/piral-cli/package.json': true,
        'src/index.tsx'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain("import { PiletApi } from 'sample-piral';");
        },
      });
    },
  );

  test(
    'from-cli-full',
    'can create a new TS pilet with modules using sample-piral from cli in the same directory',
    [],
    async (ctx) => {
      await ctx.run(`npx --package piral-cli@${cliVersion} pilet new sample-piral@${cliVersion}`);

      await ctx.assertFiles({
        'package.json'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('"sample-piral"');
          expect(content).toContain('"piral-cli"');
          expect(content).toContain(`"${ctx.id}"`);
        },
        'tsconfig.json': true,
        'node_modules/react/package.json': true,
        'src/index.tsx'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain("import { PiletApi } from 'sample-piral';");
          expect(content).toContain('export function setup(app: PiletApi) {');
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
        },
        'foo-pilet/tsconfig.json': true,
        'foo-pilet/node_modules/react/package.json': true,
        'foo-pilet/src/index.tsx'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain("import { PiletApi } from 'sample-piral';");
          expect(content).toContain('export function setup(app: PiletApi) {');
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
        },
        'tsconfig.json': false,
        'node_modules/react/package.json': false,
        'src/index.jsx'(content: string) {
          expect(content).not.toBe('');
          expect(content).not.toContain("import { PiletApi } from 'sample-piral';");
          expect(content).toContain('export function setup(app) {');
        },
      });
    },
  );

  test(
    'from-cli-init-with-installation',
    'can create a new JS pilet without installation using sample-piral from cli',
    [],
    async (ctx) => {
      await ctx.run(
        `npx --package piral-cli@${cliVersion} pilet new sample-piral@${cliVersion} --install --language js`,
      );

      await ctx.assertFiles({
        'package.json'(content: string) {
          expect(content).not.toBe('');
          expect(content).not.toContain('"typescript"');
          expect(content).toContain('"sample-piral"');
          expect(content).toContain('"piral-cli"');
          expect(content).toContain(`"${ctx.id}"`);
        },
        'tsconfig.json': false,
        'node_modules/piral-cli/package.json': true,
        'src/index.jsx'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('export function setup(app) {');
          expect(content).toContain("import * as React from 'react';");
          expect(content).toContain('<a href="https://docs.piral.io" target="_blank">Documentation</a>');
        },
      });
    },
  );

  test(
    'from-initializer-full',
    'can create a new TS pilet with modules using `sample-piral` from npm initializer',
    [],
    async (ctx) => {
      await ctx.run(npmInit(`pilet@${cliVersion}`, `--source sample-piral@${cliVersion} --defaults`));

      await ctx.assertFiles({
        'package.json'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('"sample-piral"');
          expect(content).toContain('"piral-cli"');
          expect(content).toContain(`"${ctx.id}"`);
        },
        'tsconfig.json': true,
        'node_modules/react/package.json': true,
        'src/index.tsx'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain("import { PiletApi } from 'sample-piral';");
          expect(content).toContain('export function setup(app: PiletApi) {');
        },
      });
    },
  );
});
