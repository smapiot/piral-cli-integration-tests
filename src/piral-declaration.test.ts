import { cliVersion, runTests } from './utils';

runTests('piral-declaration', ({ test, setup }) => {
  setup(async (ctx) => {
    await ctx.run(`npx --package piral-cli@${cliVersion} piral new --bundler none`);
  });

  test('declaration-standard-template', 'declaration of the standard template should work', [], async (ctx) => {
    await ctx.run(`npx piral declaration`);

    ctx.assertFiles({
      'dist/index.d.ts'(content: string) {
        expect(content).not.toBe('');
        expect(content).toContain("import * as React from 'react';");
        expect(content).toContain('export interface PiletApi extends');
        expect(content).toContain('export interface PiletCustomApi');
        expect(content).toContain('export interface PiletCoreApi');
      },
    });
  });

  test(
    'declaration-standard-template-with-default-target',
    'declaration of the standard template with default target should work',
    [],
    async (ctx) => {
      await ctx.run(`npx piral declaration --target`);

      ctx.assertFiles({
        'dist/index.d.ts'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain("import * as React from 'react';");
          expect(content).toContain('export interface PiletApi extends');
          expect(content).toContain('export interface PiletCustomApi');
          expect(content).toContain('export interface PiletCoreApi');
        },
      });
    },
  );

  test(
    'declaration-standard-template-with-a-different-target',
    'declaration of the standard template with a different target should work',
    [],
    async (ctx) => {
      await ctx.run(`npx piral declaration --target './different-target'`);

      ctx.assertFiles({
        'different-target/index.d.ts'(content: string) {
          expect(content).not.toBe('');
          expect(content).toContain("import * as React from 'react';");
          expect(content).toContain('export interface PiletApi extends');
          expect(content).toContain('export interface PiletCustomApi');
          expect(content).toContain('export interface PiletCoreApi');
        },
      });
    },
  );

  test('adding-more-types-via-extraTypes', 'adding more types via extraTypes should work', [], async (ctx) => {
    await ctx.setFiles({
      'package.json'(content: string) {
        const packageJson = JSON.parse(content);
        packageJson.extraTypes = 'src/types.ts';
        return JSON.stringify(packageJson, undefined, 2);
      },
      'src/types.ts': `export interface TypesInterface {}`,
    });

    await ctx.run(`npx piral declaration`);

    ctx.assertFiles({
      'dist/index.d.ts'(content: string) {
        expect(content).not.toBe('');
        expect(content).toContain("import * as React from 'react';");
        expect(content).toContain('export interface PiletApi extends');
        expect(content).toContain('export interface PiletCustomApi');
        expect(content).toContain('export interface PiletCoreApi');
        expect(content).toContain('export interface TypesInterface {}');
      },
    });
  });

  test('adding-more-types-via-typings', 'adding more types via typings should work', [], async (ctx) => {
    await ctx.setFiles({
      'package.json'(content: string) {
        const packageJson = JSON.parse(content);
        packageJson.typings = 'src/types.ts';
        return JSON.stringify(packageJson, undefined, 2);
      },
      'src/types.ts': `export interface TypesInterface {}`,
    });

    await ctx.run(`npx piral declaration`);

    ctx.assertFiles({
      'dist/index.d.ts'(content: string) {
        expect(content).not.toBe('');
        expect(content).toContain("import * as React from 'react';");
        expect(content).toContain('export interface PiletApi extends');
        expect(content).toContain('export interface PiletCustomApi');
        expect(content).toContain('export interface PiletCoreApi');
        expect(content).toContain('export interface TypesInterface {}');
      },
    });
  });
});
