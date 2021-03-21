const cliVersion = process.env.CLI_VERSION || 'latest';
const bundler = 'webpack';
const afterAllHandlers = [];

require('../src/piral')({ jest, describe, it, afterAll, expect, afterAllHandlers }, cliVersion, bundler, 38080);
require('../src/pilet')({ jest, describe, it, afterAll, expect, afterAllHandlers }, cliVersion, bundler, 38081);

afterAll(() => {
  afterAllHandlers.forEach((handler) => handler());
});
