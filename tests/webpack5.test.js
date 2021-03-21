const bundler = 'webpack5';
const afterAllHandlers = [];

require('../src/piral')({ jest, describe, it, afterAll, expect, afterAllHandlers }, bundler, 38082);
require('../src/pilet')({ jest, describe, it, afterAll, expect, afterAllHandlers }, bundler, 38083);

afterAll(() => {
  afterAllHandlers.forEach((handler) => handler());
});
