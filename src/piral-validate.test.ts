import { prepareTests, TestEnvironment } from './utils';

let testEnv: TestEnvironment;

describe('piral-validate', () => {
  beforeAll(async () => {
    testEnv = await prepareTests('piral-validate');
  });

  it('foo', async () => {});
});
