import { prepareTests, TestEnvironment } from './utils';

let testEnv: TestEnvironment;

describe('piral-upgrade', () => {
  beforeAll(async () => {
    testEnv = await prepareTests('piral-upgrade');
  });

  it('foo', async () => {});
});
