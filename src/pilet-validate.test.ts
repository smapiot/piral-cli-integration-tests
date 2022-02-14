import { prepareTests, TestEnvironment } from './utils';

let testEnv: TestEnvironment;

describe('pilet-validate', () => {
  beforeAll(async () => {
    testEnv = await prepareTests('pilet-validate');
  });

  it('foo', async () => {});
});
