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
      'dist/emulator': false,
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
      'dist/release': false,
      ' dist/emulator': false,
    });
  });

  test('emulator-sources-standard-template', 'can produce emulator sources build', ['build.piral'], async (ctx) => {
    await ctx.run(`npx piral build --type emulator-sources`);

    await ctx.assertFiles({
      'node_modules/piral-cli/package.json': true,
      'dist/emulator/package.json': true,
      'dist/emulator/app/index.html': true,
      'dist/release': false,
    });
  });

  test(
    'some-invalid-type-standard-template',
    'can not produce build with invalid type',
    ['build.piral'],
    async (ctx) => {
      try {
        await ctx.run(`npx piral build --type some-invalid-type-standard-template`);
        expect(true).toBe(false);
      } catch {}

      await ctx.assertFiles({
        'dist/release': false,
        'dist/emulator': false,
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
          const jsFile = /[a-zA-Z0-9\.\-\_]*?\.js/g.exec(content)[0];
          expect(content).toContain(`src="/${jsFile}"`);
          const cssFile =  /href="\/[a-zA-Z0-9\.\-\_]*?\.css"/g.exec(content)[0]
          expect(content).toContain(cssFile);
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
          const jsFile = /\/different-public-url\/[a-zA-Z0-9\.\-\_]*?\.js/g.exec(content)[0];
          expect(content).toContain(`src="${jsFile}`);
          const cssFile = /\/different-public-url\/[a-zA-Z0-9\.\-\_]*?.\.css"/g.exec(content)[0];
          expect(content).toContain(`href="${cssFile}`);
        },
      });
    },
  );

  test(
    'release-standard-template-with-default-target',
    'can produce a release build with default target ./dist',
    ['build.piral'],
    async (ctx) => {
      await ctx.run(`npx piral build --type release --target`);

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
        'different-target/emulator': false,
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
          expect(indexFileContent).not.toBe('');
          expect(indexFileContent).not.toContain('_useNextAtomId');
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
          expect(indexFileContent).toContain('_useNextAtomId');
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
