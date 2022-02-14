import { prepareTests, TestEnvironment } from './utils';

let testEnv: TestEnvironment;

describe('piral-debug', () => {
  beforeAll(async () => {
    testEnv = await prepareTests('piral-debug');
  });

  it('foo', async () => {});
});
