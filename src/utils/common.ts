import { expect, describe, it, beforeEach } from '@jest/globals';
import { promises as fsPromises } from 'fs';
import { resolve } from 'path';
import { rimraf, copyAll } from './io';
import { createTestContextFactory } from './context';
import { TestEnvironment, TestEnvironmentRef } from './types';

expect.extend({
  toBePresent(received: string, status: boolean) {
    if (status) {
      return {
        message: () => `File "${received}" exists but should be missing.`,
        pass: true,
      };
    } else {
      return {
        message: () => `File "${received}" should be existing but does not.`,
        pass: false,
      };
    }
  },
});

const allFeatures = [
  'codegen',
  'splitting',
  'pilet.v0',
  'pilet.v1',
  'pilet.v2',
  'importmap.ref',
  'importmap.local',
  'build.pilet',
  'build.piral',
  'build.emulator',
  'debug.pilet',
  'debug.piral',
  'hmr',
].join(',');

export const cliVersion = process.env.CLI_VERSION || 'next';
export const selectedBundler = process.env.BUNDLER_PLUGIN || `piral-cli-webpack5@${cliVersion}`;
export const isBundlerPlugin = !!process.env.BUNDLER_PLUGIN;
export const bundlerFeatures = (process.env.BUNDLER_FEATURES || allFeatures).split(',');

export function runTests(area: string, cb: (ref: TestEnvironmentRef) => void) {
  let template = undefined;
  const ref: TestEnvironmentRef = {
    env: undefined,
    setup(cb) {
      beforeEach(async () => {
        if (!template) {
          template = await ref.env.createTestContext('_template');
          await cb(template);
        }
      });
    },
    test(prefix, description, flags, cb) {
      const noTemplate = flags.includes('#empty');
      const features = flags.filter(flag => !flag.startsWith('#'));
      // either we run in the "standard repo" (i.e., not as a bundler plugin)
      // or we need to have some bundler-features defined (and all features should be available from the bundler - otherwise its broken by default)
      const canRun = !isBundlerPlugin || (features.length > 0 && features.every((s) => bundlerFeatures.includes(s)));
      const define = canRun ? it : it.skip;

      define(description, async () => {
        const ctx = await ref.env.createTestContext(prefix);

        if (!noTemplate && template) {
          await copyAll(template.root, ctx.root);
        }

        await cb(ctx);
      });
    },
  };

  describe(area, () => {
    beforeAll(async () => {
      ref.env = await prepareTests(area);
    });

    cb(ref);
  });
}

export async function prepareTests(area: string): Promise<TestEnvironment> {
  const dir = resolve(__dirname, '..', '..', 'dist', area);
  const createTestContext = createTestContextFactory(dir);
  await rimraf(dir);
  await fsPromises.mkdir(dir, { recursive: true });
  return {
    dir,
    createTestContext,
  };
}
