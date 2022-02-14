import { cliVersion, runTests, run } from './utils';

runTests('piral-new', ({ test }) => {
  test('from-cli-full', 'can create a new TS piral instance with modules using `piral` from cli in the same directory', [], async (ctx) => {
    await run(`npx --package piral-cli@${cliVersion} piral new --tag ${cliVersion}`, ctx.root);

    await ctx.assertFiles({
      'package.json'(content) {
        expect(content).not.toBe('');
        expect(content).toContain('"typescript"');
        expect(content).toContain('"piral"');
        expect(content).toContain('"piral-cli"');
        expect(content).toContain(`"${ctx.id}"`);
        return true;
      },
      'tsconfig.json': true,
      'node_modules/piral-cli/package.json': true,
      'src/index.html'(content) {
        expect(content).not.toBe('');
        expect(content).toContain('<script src="./index.tsx"></script>');
        return true;
      },
      'src/index.tsx'(content) {
        expect(content).not.toBe('');
        expect(content).toContain("from 'piral'");
        expect(content).toContain("const feedUrl = 'https://feed.piral.cloud/api/v1/pilet/empty';");
        return true;
      },
    });
  });

  test('from-cli-moved', 'can create a new TS piral instance with modules using `piral-core` from cli in a new directory', [], async (ctx) => {
    await run(`npx --package piral-cli@${cliVersion} piral new --tag ${cliVersion} --framework piral-core --base my-piral-instance`, ctx.root);

    await ctx.assertFiles({
      'my-piral-instance/package.json'(content) {
        expect(content).not.toBe('');
        expect(content).toContain('"typescript"');
        expect(content).toContain('"piral-core"');
        expect(content).toContain('"piral-cli"');
        expect(content).toContain(`"my-piral-instance"`);
        return true;
      },
      'my-piral-instance/tsconfig.json': true,
      'my-piral-instance/node_modules/piral-cli/package.json': true,
      'my-piral-instance/src/index.html'(content) {
        expect(content).not.toBe('');
        expect(content).toContain('<script src="./index.tsx"></script>');
        return true;
      },
      'my-piral-instance/src/index.tsx'(content) {
        expect(content).not.toBe('');
        expect(content).toContain('from "piral-core"');
        expect(content).toContain('fetch("https://feed.piral.cloud/api/v1/pilet/empty")');
        expect(content).toContain('render(<Piral instance={instance} />, document.querySelector("#app"));');
        return true;
      },
    });
  });

  test('from-cli-init', 'can create a new JS piral instance without installation using `piral` from cli', [], async (ctx) => {
    await run(`npx --package piral-cli@${cliVersion} piral new --no-install --language js --tag ${cliVersion}`, ctx.root);

    await ctx.assertFiles({
      'package.json'(content) {
        expect(content).not.toBe('');
        expect(content).not.toContain('"typescript"');
        expect(content).toContain('"piral"');
        expect(content).toContain('"piral-cli"');
        expect(content).toContain(`"${ctx.id}"`);
        return true;
      },
      'tsconfig.json': false,
      'node_modules/piral-cli/package.json': false,
      'src/index.html'(content) {
        expect(content).not.toBe('');
        expect(content).toContain('<script src="./index.jsx"></script>');
        return true;
      },
      'src/index.jsx'(content) {
        expect(content).not.toBe('');
        expect(content).toContain("from 'piral'");
        expect(content).toContain("const feedUrl = 'https://feed.piral.cloud/api/v1/pilet/empty';");
        return true;
      },
    });
  });

  test('from-initializer-full', 'can create a new TS piral instance with modules using `piral` from npm initializer', [], async (ctx) => {
    await run(`npm init piral-instance@${cliVersion} --tag ${cliVersion} --defaults`, ctx.root);

    await ctx.assertFiles({
      'package.json'(content) {
        expect(content).not.toBe('');
        expect(content).toContain('"typescript"');
        expect(content).toContain('"piral"');
        expect(content).toContain('"piral-cli"');
        expect(content).toContain(`"${ctx.id}"`);
        return true;
      },
      'tsconfig.json': true,
      'node_modules/piral-cli/package.json': true,
      'src/index.html'(content) {
        expect(content).not.toBe('');
        expect(content).toContain('<script src="./index.tsx"></script>');
        return true;
      },
      'src/index.tsx'(content) {
        expect(content).not.toBe('');
        expect(content).toContain("from 'piral'");
        expect(content).toContain("const feedUrl = 'https://feed.piral.cloud/api/v1/pilet/empty';");
        return true;
      },
    });
  });
});
