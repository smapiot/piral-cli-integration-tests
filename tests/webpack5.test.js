const cliVersion = process.env.CLI_VERSION || "latest";
const bundler = "webpack5";
const afterAllHandlers = [];

require("./piral")({ jest, describe, it, afterAll, expect, afterAllHandlers }, cliVersion, bundler, 38082);
require("./pilet")({ jest, describe, it, afterAll, expect, afterAllHandlers }, cliVersion, bundler, 38083);

afterAll(() => {
    afterAllHandlers.forEach((handler) => handler());
});
