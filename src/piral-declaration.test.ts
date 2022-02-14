import { prepareTests, TestEnvironment } from './utils';

let testEnv: TestEnvironment;

describe('piral-declaration', () => {
  beforeAll(async () => {
    testEnv = await prepareTests('piral-declaration');
  });

  it('foo', async () => {});
});
