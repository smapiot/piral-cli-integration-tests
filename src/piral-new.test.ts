import { prepareTests, TestEnvironment } from './utils';

let testEnv: TestEnvironment;

describe('piral-new', () => {
  beforeAll(async () => {
    testEnv = await prepareTests('piral-new');
  });

  it('foo', async () => {});
});
