const { toMatchFilesystemSnapshot } = require("jest-fs-snapshot");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");

const execute = promisify(exec);

expect.extend({ toMatchFilesystemSnapshot });
jest.setTimeout(120 * 1000); // 60 second timeout

describe("piral", () => {
    it("scaffold piral", async () => {
        // TODO: npm list | tail -n +2 > package.list &&
        const info = await execute(`
        rm -rf piral-inst &&
        mkdir piral-inst &&
        cd piral-inst &&
        npm init piral-instance -y &&
        rm -rf node_modules package-lock.json
    `);

        expect(info.stderr).toBe("");

        const pathToBuildDir = path.resolve(process.cwd(), "piral-inst");
        expect(pathToBuildDir).toMatchFilesystemSnapshot();
    });
});
