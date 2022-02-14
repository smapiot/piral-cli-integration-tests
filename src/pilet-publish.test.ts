import { prepareTests, TestEnvironment } from './utils';

let testEnv: TestEnvironment;

describe('pilet-publish', () => {
  beforeAll(async () => {
    testEnv = await prepareTests('pilet-publish');
  });

  it('foo', async () => {});
});
