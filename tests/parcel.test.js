const bundler = 'parcel';
const afterAllHandlers = [];

require('../src/piral')({ jest, describe, it, afterAll, expect, afterAllHandlers }, bundler, 38084);
require('../src/pilet')({ jest, describe, it, afterAll, expect, afterAllHandlers }, bundler, 38085);

afterAll(() => {
  afterAllHandlers.forEach((handler) => handler());
});
