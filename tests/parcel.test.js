const cliVersion = process.env.CLI_VERSION || "latest";
const bundler = "parcel";
const afterAllHandlers = [];

require("./piral")({ jest, describe, it, afterAll, expect, afterAllHandlers }, cliVersion, bundler, 38084);
require("./pilet")({ jest, describe, it, afterAll, expect, afterAllHandlers }, cliVersion, bundler, 38085);

afterAll(() => {
    afterAllHandlers.forEach((handler) => handler());
});
