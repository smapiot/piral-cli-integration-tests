import { prepareTests, TestEnvironment } from './utils';

let testEnv: TestEnvironment;

describe('pilet-build', () => {
  beforeAll(async () => {
    testEnv = await prepareTests('pilet-build');
  });

  it('foo', async () => {});
});
