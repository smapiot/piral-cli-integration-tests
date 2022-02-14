import { prepareTests, TestEnvironment } from './utils';

let testEnv: TestEnvironment;

describe('piral-build', () => {
  beforeAll(async () => {
    testEnv = await prepareTests('piral-build');
  });

  it('foo', async () => {});
});
