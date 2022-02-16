import axios from 'axios';
import { cliVersion, createServer, runTests, ServerRunner } from './utils';

runTests('pilet-publish', ({ test, setup }) => {
  let server: ServerRunner;

  beforeEach(() => {
    server = createServer(3000);
    return server.start();
  });

  afterEach(() => {
    return server.stop();
  });

  setup(async (ctx) => {
    await ctx.run(`npx --package piral-cli@${cliVersion} pilet new sample-piral@${cliVersion} --bundler webpack5`);
  });

  test('from-packed-sources', 'can publish the pilet from packed sources', [], async (ctx) => {
    await ctx.run(`npx pilet build`);

    await ctx.run(`npx pilet pack`);

    await ctx.run(`npx pilet publish *.tgz --url ${server.url} --api-key ${server.apiKey}`);

    await ctx.assertFiles({
      '*.tgz'(files: Array<string>) {
        expect(files).toHaveLength(1);
      },
    });

    const res = await axios.get(server.url);
    const pilets = res.data;

    expect(pilets).toEqual({
      items: [
        {
          dependencies: {},
          integrity: expect.anything(),
          link: expect.anything(),
          name: expect.anything(),
          requireRef: expect.anything(),
          spec: 'v2',
          version: '1.0.0',
        },
      ],
    });
  });

  test('from-fresh-bundle', 'can publish the pilet with a fresh bundle', [], async (ctx) => {
    await ctx.run(`npx pilet publish --fresh --url ${server.url} --api-key ${server.apiKey}`);

    await ctx.assertFiles({
      '*.tgz'(files: Array<string>) {
        expect(files).toHaveLength(1);
      },
    });

    const res = await axios.get(server.url);
    const pilets = res.data;

    expect(pilets).toEqual({
      items: [
        {
          dependencies: {},
          integrity: expect.anything(),
          link: expect.anything(),
          name: expect.anything(),
          requireRef: expect.anything(),
          spec: 'v2',
          version: '1.0.0',
        },
      ],
    });
  });

  test('from-invalid-api-key', 'cannot publish the pilet with an invalid key', [], async (ctx) => {
    await ctx.run(`npx pilet publish --fresh --url ${server.url} --api-key invalid`).catch(() => {});

    await ctx.assertFiles({
      '*.tgz'(files: Array<string>) {
        expect(files).toHaveLength(1);
      },
    });

    const res = await axios.get(server.url);
    const pilets = res.data;

    expect(pilets).toEqual({
      items: [],
    });
  });
});
