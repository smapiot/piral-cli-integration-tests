import { cliVersion, runTests, selectedBundler } from './utils';

runTests('pilet-build', ({ test, setup }) => {
  setup(async (ctx) => {
    await ctx.run(`npx --package piral-cli@${cliVersion} pilet new sample-piral@${cliVersion} --bundler none`);
    await ctx.run(`npm i ${selectedBundler} --save-dev`);
    await ctx.run(`npm i emojis-list@3.0.0`);
  });

  test(
    'from-sample-piral-directly-v2',
    'can build a standard templated v2 pilet from sample-piral',
    ['pilet.v2', 'build.pilet'],
    async (ctx) => {
      await ctx.run(`npx pilet build`);

      await ctx.assertFiles({
        'dist/index.js'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('//@pilet v:2');
          expect(content).toContain('System.register(');
          expect(content).not.toContain('currentScript.app=');
          expect(content).not.toContain('require("react")');
        },
      });
    },
  );

  test(
    'from-sample-piral-directly-v1',
    'can build a standard templated v1 pilet from sample-piral',
    ['pilet.v1', 'build.pilet'],
    async (ctx) => {
      await ctx.run(`npx pilet build --schema v1`);

      await ctx.assertFiles({
        'dist/index.js'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('//@pilet v:1');
          expect(content).not.toContain('System.register(');
          expect(content).toContain('currentScript.app=');
        },
      });
    },
  );

  test(
    'from-sample-piral-directly-v0',
    'can build a standard templated v0 pilet from sample-piral',
    ['pilet.v0', 'build.pilet'],
    async (ctx) => {
      await ctx.run(`npx pilet build --schema v0`);

      await ctx.assertFiles({
        'dist/index.js'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('//@pilet v:0');
          expect(content).not.toContain('System.register(');
          expect(content).not.toContain('currentScript.app=');
          expect(content).toContain('require("react")');
        },
      });
    },
  );

  test(
    'from-sample-piral-bundle-splitting',
    'can build a pilet with bundle splitting from sample-piral',
    ['pilet.v2', 'build.pilet', 'splitting'],
    async (ctx) => {
      await ctx.setFiles({
        'src/Page.tsx': `
          import * as React from 'react';
          export default () => <><h1>Sample</h1><p>Lorem</p></>;
        `,
        'src/index.tsx': `
          import * as React from 'react';
          import { PiletApi } from 'sample-piral';

          const Page = React.lazy(() => import('./Page'));

          export function setup(api: PiletApi) {
            api.registerPage('/foo', Page);
          }
        `,
      });

      await ctx.run(`npx pilet build`);

      await ctx.assertFiles({
        'dist/index.js'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('//@pilet v:2');
          expect(content).toContain('System.register(');
        },
        'dist/*.js'(files: Array<string>) {
          const nonIndexFiles = files.filter((f) => f !== 'dist/index.js');
          expect(nonIndexFiles).toHaveLength(1);
        },
      });
    },
  );

  test(
    'from-sample-piral-with-css',
    'can build a pilet with CSS from sample-piral',
    ['pilet.v2', 'build.pilet'],
    async (ctx) => {
      await ctx.setFiles({
        'src/style.css': `
          .foo { color: red }
        `,
        'src/index.tsx': `
          import * as React from 'react';
          import { PiletApi } from 'sample-piral';
          import './style.css';

          export function setup(api: PiletApi) {
            api.registerPage('/foo', () => <div className="foo">Content</div>);
          }
        `,
      });

      await ctx.run(`npx pilet build`);

      await ctx.assertFiles({
        'dist/index.js'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('//@pilet v:2');
          expect(content).toContain('System.register(');
          expect(content).toContain('createElement("link")');
        },
        'dist/*.css'(files: Array<string>) {
          expect(files).toHaveLength(1);
        },
      });
    },
  );

  test(
    'from-sample-piral-with-importmap-local',
    'can build a pilet using an importmap with local reference from sample-piral',
    ['pilet.v2', 'build.pilet', 'importmap.ref', 'importmap.local'],
    async (ctx) => {
      await ctx.setFiles({
        'package.json'(content: string) {
          const data = JSON.parse(content);
          data.importmap = {
            imports: {
              'emojis-list': 'emojis-list',
            },
          };
          return JSON.stringify(data, undefined, 2);
        },
        'src/index.tsx': `
          import * as React from 'react';
          import { PiletApi } from 'sample-piral';
          import emojisList from 'emojis-list';

          export function setup(api: PiletApi) {
            api.registerPage('/foo', () => <div>{emojisList[25]}</div>);
          }
        `,
      });

      await ctx.run(`npx pilet build`);

      await ctx.assertFiles({
        'dist/emojis-list.js': true,
        'dist/index.js'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('//@pilet v:2');
          expect(content).toContain(',{"emojis-list@3.0.0":"emojis-list.js"})');
        },
      });
    },
  );

  test(
    'from-sample-piral-with-importmap-remote',
    'can build a pilet using an importmap with remote reference from sample-piral',
    ['pilet.v2', 'build.pilet', 'importmap.ref'],
    async (ctx) => {
      await ctx.setFiles({
        'package.json'(content: string) {
          const data = JSON.parse(content);
          data.importmap = {
            imports: {
              'emojis-list': 'https://unpkg.com/browse/emojis-list@3.0.0/index.js',
            },
          };
          return JSON.stringify(data, undefined, 2);
        },
        'src/index.tsx': `
          import * as React from 'react';
          import { PiletApi } from 'sample-piral';
          import emojisList from 'emojis-list';

          export function setup(api: PiletApi) {
            api.registerPage('/foo', () => <div>{emojisList[25]}</div>);
          }
        `,
      });

      await ctx.run(`npx pilet build`);

      await ctx.assertFiles({
        'dist/emojis-list.js': false,
        'dist/index.js'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain('//@pilet v:2');
          expect(content).toContain(',{"emojis-list@b881d6c":"https://unpkg.com/browse/emojis-list@3.0.0/index.js"})');
        },
      });
    },
  );
});
