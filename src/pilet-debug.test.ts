import { prepareTests, TestEnvironment } from './utils';

let testEnv: TestEnvironment;

describe('pilet-debug', () => {
  beforeAll(async () => {
    testEnv = await prepareTests('pilet-debug');
  });

  it('foo', async () => {});
});
