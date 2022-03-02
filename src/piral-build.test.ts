import { cliVersion, npmInit, runTests, selectedBundler } from './utils';

runTests('piral-build', ({ test, setup }) => {
  setup(async (ctx) => {
    await ctx.run(`npx --package piral-cli@${cliVersion} piral new --bundler none`);
    await ctx.run(`npm i ${selectedBundler} --save-dev`);
    await ctx.run(`npm i emojis-list@3.0.0`);
  });

  test('release-standard-template', 'can produce a release build', ['build.piral'], async (ctx) => {
    await ctx.run(`npx piral build --type release`);

    await ctx.assertFiles({
      'dist/release/index.html'(content: string) {
        expect(content).not.toBe('');
      },
    });
  });

  test('emulator-standard-template', 'can produce an emulator build', ['build.piral'], async (ctx) => {
    await ctx.setFiles({
      'package.json'(content: string) {
        const packageJson = JSON.parse(content);
        packageJson.name = 'app-shell';
        return JSON.stringify(packageJson, undefined, 2);
      },
    });

    await ctx.run(`npx piral build --type emulator`);

    await ctx.assertFiles({
      'dist/emulator/*.tgz'(files: Array<string>) {
        expect(files).toHaveLength(1);
        ctx.setRef('emulator', files[0]);
      },
    });
  });

  test('emulator-sources-standard-template', 'can produce emulator sources build', ['build.piral'], async (ctx) => {
    await ctx.run(`npx piral build --type emulator-sources`);

    await ctx.assertFiles({
      'package-lock.json': true,
      'package.json'(content: string) {
        expect(content).toContain('"pilets": {');
      },
      'node_modules/piral-cli/package.json': true,
      'emulator/package.json': true,
      'emulator/app/index.html'(content: string) {
        expect(content).not.toBe('');
        expect(content).toContain('<title>My Piral Instance</title>');
        expect(content).toContain('<script defer src="/index.b68111.js"></script>');
      },
    });
  });

  test(
    'some-invalid-type-standard-template',
    'can not produce build with invalid type',
    ['build.piral'],
    async (ctx) => {
      try {
        await ctx.run(`npx piral build --type some-invalid-type-standard-template`);
      } catch {}

      await ctx.assertFiles({
        'package.json': true,
        'tsconfig.json': true,
        'node_modules/piral-cli/package.json': true,
        'src/index.html': true,
        'package-lock.json': true,
      });
    },
  );

  test(
    'release-standard-template-with-default-public-url',
    'can produce a release build with default public url',
    ['build.piral'],
    async (ctx) => {
      await ctx.run(`npx piral build --type release --public-url '/'`);

      await ctx.assertFiles({
        'dist/release/index.html'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('<script defer="defer" src="/index.');
        },
      });
    },
  );

  test(
    'release-standard-template-with-a-different-public-url',
    'can produce a release build with a different public url ./',
    ['build.piral'],
    async (ctx) => {
      await ctx.run(`npx piral build --type release --public-url 'different-public-url/'`);

      await ctx.assertFiles({
        'dist/release/index.html'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('<script defer="defer" src="/different-public-url/index.');
        },
      });
    },
  );

  test(
    'release-standard-template-with-default-target',
    'can produce a release build with default target ./dist',
    ['build.piral'],
    async (ctx) => {
      await ctx.run(`npx piral build --type release --target './dist'`);

      await ctx.assertFiles({
        'dist/release/index.html'(content: string) {
          expect(content).not.toBe('');
        },
      });
    },
  );

  test(
    'release-standard-template-with-a-different-target',
    'can produce a release build with a different target',
    ['build.piral'],
    async (ctx) => {
      await ctx.run(`npx piral build --type release --target './different-target'`);

      await ctx.assertFiles({
        'different-target/release/index.html'(content: string) {
          expect(content).not.toBe('');
        },
      });
    },
  );

  test(
    'release-standard-template-with-minify',
    'can produce a release build with minify',
    ['build.piral'],
    async (ctx) => {
      await ctx.run(`npx piral build --type release --minify`);

      await ctx.assertFiles({
        async 'dist/release/index.html'(content: string) {
          expect(content).not.toBe('');
          const indexFile = /<script.*?src="\/(.*?)"/g.exec(content)[1];

          const indexFileContent = await ctx.readFile(`dist/release/${indexFile}`);
          expect(indexFileContent).toContain(
            '(()=>{var e={2725:function(e,t,n){"undefined"!=typeof self&&self,e.exports=function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};',
          );
          expect(indexFileContent).toContain(
            'Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},',
          );
        },
      });
    },
  );

  test(
    'release-standard-template-without-minify',
    'can produce a release build without minify',
    ['build.piral'],
    async (ctx) => {
      await ctx.run(`npx piral build --type release --no-minify`);

      await ctx.assertFiles({
        async 'dist/release/index.html'(content: string) {
          expect(content).not.toBe('');
          const indexFile = /<script.*?src="\/(.*?)"/g.exec(content)[1];

          const indexFileContent = await ctx.readFile(`dist/release/${indexFile}`);
          expect(indexFileContent).toContain('function _useNextAtomId() {');
          expect(indexFileContent).toContain('var didValidate = validator(nextState);');
          expect(indexFileContent).toContain('function setValidator(atom, validator) {');
        },
      });
    },
  );

  test('emulator-scaffold', 'can scaffold from the emulator', ['#empty'], async (ctx) => {
    const source = ctx.getRef('emulator');

    await ctx.run(npmInit(`pilet@${cliVersion}`, `--source ${source} --bundler none --defaults`));

    await ctx.assertFiles({
      'package.json'(content: string) {
        const packageJson = JSON.parse(content);
        const appShell = packageJson.piral.name;
        expect(appShell).toBe('app-shell');
      },
      'node_modules/app-shell/package.json': true,
      'node_modules/app-shell/app/index.html': true,
    });
  });
});
