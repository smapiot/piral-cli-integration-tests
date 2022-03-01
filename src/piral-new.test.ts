import { cliVersion, npmInit, runTests } from './utils';

runTests('piral-new', ({ test }) => {
  test(
    'from-cli-full',
    'can create a new TS piral instance with modules using `piral` from cli in the same directory',
    [],
    async (ctx) => {
      await ctx.run(`npx --package piral-cli@${cliVersion} piral new --tag ${cliVersion}`);

      await ctx.assertFiles({
        'package.json'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('"typescript"');
          expect(content).toContain('"piral"');
          expect(content).toContain('"piral-cli"');
          expect(content).toContain(`"${ctx.id}"`);
        },
        'tsconfig.json': true,
        'node_modules/piral-cli/package.json': true,
        'src/index.html'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('<script src="./index.tsx"></script>');
        },
        'src/index.tsx'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain("from 'piral'");
          expect(content).toContain("const feedUrl = 'https://feed.piral.cloud/api/v1/pilet/empty';");
        },
      });
    },
  );

  test(
    'from-cli-different-framework',
    'can create a new TS piral instance with modules using piral-base from cli in the same directory',
    [],
    async (ctx) => {
      await ctx.run(`npx --package piral-cli@${cliVersion} piral new --tag ${cliVersion} --framework piral-base`);

      await ctx.assertFiles({
        'package.json'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('"typescript"');
          expect(content).toContain('"piral-base"');
          expect(content).toContain('"piral-cli"');
          expect(content).toContain(`"${ctx.id}"`);
        },
        'tsconfig.json': true,
        'node_modules/piral-cli/package.json': true,
        'src/index.html'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('<script src="./index.ts"></script>');
        },
        'src/index.ts'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('from "piral-base"');
          expect(content).toContain('return fetch("https://feed.piral.cloud/api/v1/pilet/empty")');
        },
      });
    },
  );

  test(
    'from-cli-moved',
    'can not create a new TS piral instance with modules using `piral-core` from cli in a new directory',
    [],
    async (ctx) => {
      await ctx.run(
        `npx --package piral-cli@${cliVersion} piral new --tag ${cliVersion} --framework piral-core --base my-piral-instance`,
      );

      await ctx.assertFiles({
        'my-piral-instance/package.json'(content) {
          expect(content).not.toBe('');
          expect(content).toContain('"typescript"');
          expect(content).toContain('"piral-core"');
          expect(content).toContain('"piral-cli"');
          expect(content).toContain(`"my-piral-instance"`);
        },
        'my-piral-instance/tsconfig.json': true,
        'my-piral-instance/node_modules/piral-cli/package.json': true,
        'my-piral-instance/src/index.html'(content) {
          expect(content).not.toBe('');
          expect(content).toContain('<script src="./index.tsx"></script>');
        },
        'my-piral-instance/src/index.tsx'(content) {
          expect(content).not.toBe('');
          expect(content).toContain('from "piral-core"');
          expect(content).toContain('fetch("https://feed.piral.cloud/api/v1/pilet/empty")');
          expect(content).toContain('render(<Piral instance={instance} />, document.querySelector("#app"));');
        },
      });
    },
  );

  test(
    'from-cli-invalid-template',
    'can create a new TS piral instance without modules using invalid template from cli in the same directory',
    [],
    async (ctx) => {
      try {
        await ctx.run(
          `npx --package piral-cli@${cliVersion} piral new --tag ${cliVersion} --no-install --template some-invalid-template-foo`,
        );
        expect(true).toBe(false);
      } catch {}

      await ctx.assertFiles({
        'package.json': true,
        'tsconfig.json': false,
        'node_modules/piral-cli/package.json': false,
        'src/index.html': false,
      });
    },
  );

  test(
    'from-cli-empty-template',
    'can create a new TS piral instance without modules using empty template from cli in the same directory',
    [],
    async (ctx) => {
      await ctx.run(
        `npx --package piral-cli@${cliVersion} piral new --tag ${cliVersion} --no-install --template empty`,
      );

      await ctx.assertFiles({
        'package.json': true,
        'tsconfig.json': true,
        'node_modules/piral-cli/package.json': false,
        'src/index.html'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('<script src="./index.tsx"></script>');
        },
        'src/index.tsx'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain("import { renderInstance } from 'piral';");
          expect(content).toContain('renderInstance();');
        },
      });
    },
  );

  test(
    'from-cli-empty-template-language-js',
    'can create a new JS piral instance without modules using empty template from cli in the same directory',
    [],
    async (ctx) => {
      await ctx.run(
        `npx --package piral-cli@${cliVersion} piral new --no-install --template empty --language js --tag ${cliVersion}`,
      );

      await ctx.assertFiles({
        'package.json': true,
        'tsconfig.json': false,
        'node_modules/piral-cli/package.json': false,
        'src/index.html': true,
        'src/index.jsx': true,
      });
    },
  );

  test(
    'from-cli-default-registry',
    'can create a new TS piral instance with the default registry from cli in a new directory',
    [],
    async (ctx) => {
      await ctx.run(
        `npx --package piral-cli@${cliVersion} piral new --tag ${cliVersion} --registry https://registry.npmjs.org/`,
      );

      await ctx.assertFiles({
        'package.json'(content) {
          expect(content).not.toBe('');
          expect(content).toContain('"typescript"');
          expect(content).toContain('"piral"');
          expect(content).toContain('"piral-cli"');
        },
        '.npmrc': false,
        'tsconfig.json': true,
        'node_modules/piral-cli/package.json': true,
        'src/index.html': true,
        'src/index.tsx': true,
      });
    },
  );

  test(
    'from-cli-custom-registry',
    'can create a new TS piral instance with a custom registry from cli in a new directory',
    [],
    async (ctx) => {
      await ctx.run(
        `npx --package piral-cli@${cliVersion} piral new --tag ${cliVersion} --registry https://registry.npmmirror.com/`,
      );

      await ctx.assertFiles({
        'package.json'(content) {
          expect(content).not.toBe('');
          expect(content).toContain('"typescript"');
          expect(content).toContain('"piral"');
          expect(content).toContain('"piral-cli"');
        },
        '.npmrc'(content) {
          expect(content).toContain('registry=https://registry.npmmirror.com/');
        },
        'tsconfig.json': true,
        'node_modules/piral-cli/package.json': true,
        'src/index.html': true,
        'src/index.tsx': true,
      });
    },
  );

  test(
    'from-cli-init',
    'can create a new JS piral instance without installation using piral from cli',
    [],
    async (ctx) => {
      await ctx.run(`npx --package piral-cli@${cliVersion} piral new --no-install --language js --tag ${cliVersion}`);

      await ctx.assertFiles({
        'package.json'(content: string) {
          expect(content).not.toBe('');
          expect(content).not.toContain('"typescript"');
          expect(content).toContain('"piral"');
          expect(content).toContain('"piral-cli"');
          expect(content).toContain(`"${ctx.id}"`);
        },
        'tsconfig.json': false,
        'node_modules/piral-cli/package.json': false,
        'src/index.html'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('<script src="./index.jsx"></script>');
        },
        'src/index.jsx'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain("from 'piral'");
          expect(content).toContain("const feedUrl = 'https://feed.piral.cloud/api/v1/pilet/empty';");
        },
      });
    },
  );

  test(
    'from-cli-init-with-installation',
    'can create a new JS piral instance with installation using piral from cli',
    [],
    async (ctx) => {
      await ctx.run(`npx --package piral-cli@${cliVersion} piral new --install --language js --tag ${cliVersion}`);

      await ctx.assertFiles({
        'package.json'(content: string) {
          expect(content).not.toBe('');
          expect(content).not.toContain('"typescript"');
          expect(content).toContain('"piral"');
          expect(content).toContain('"piral-cli"');
          expect(content).toContain(`"${ctx.id}"`);
        },
        'tsconfig.json': false,
        'node_modules/piral-cli/package.json': true,
        'src/index.html'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('<script src="./index.jsx"></script>');
        },
        'src/index.jsx'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain("from 'piral'");
          expect(content).toContain("const feedUrl = 'https://feed.piral.cloud/api/v1/pilet/empty';");
        },
      });
    },
  );

  test(
    'from-initializer-full',
    'can create a new TS piral instance with modules using `piral` from npm initializer',
    [],
    async (ctx) => {
      await ctx.run(npmInit(`piral-instance@${cliVersion}`, `--tag ${cliVersion} --defaults`));

      await ctx.assertFiles({
        'package.json'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('"typescript"');
          expect(content).toContain('"piral"');
          expect(content).toContain('"piral-cli"');
          expect(content).toContain(`"${ctx.id}"`);
        },
        'tsconfig.json': true,
        'node_modules/piral-cli/package.json': true,
        'src/index.html'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('<script src="./index.tsx"></script>');
        },
        'src/index.tsx'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain("from 'piral'");
          expect(content).toContain("const feedUrl = 'https://feed.piral.cloud/api/v1/pilet/empty';");
        },
      });
    },
  );
});
