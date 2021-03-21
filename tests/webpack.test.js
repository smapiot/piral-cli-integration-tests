const bundler = 'webpack';
const afterAllHandlers = [];

require('../src/piral')({ jest, describe, it, afterAll, expect, afterAllHandlers }, bundler, 38080);
require('../src/pilet')({ jest, describe, it, afterAll, expect, afterAllHandlers }, bundler, 38081);

afterAll(() => {
  afterAllHandlers.forEach((handler) => handler());
});
