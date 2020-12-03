const { toMatchFilesystemSnapshot } = require("jest-fs-snapshot");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");

const execute = promisify(exec);

expect.extend({ toMatchFilesystemSnapshot });
jest.setTimeout(60 * 1000); // 60 second timeout

it("build pilet", async () => {
    const info = await execute(`
        rm -rf pilet-build &&
        mkdir pilet-build &&
        cd pilet-build &&
        npm init pilet -y &&
        npm list > package.list &&
        rm -rf node_modules
    `);

    expect(info.stderr).toBe("");

    const pathToBuildDir = path.resolve(process.cwd(), "pilet-build");
    expect(pathToBuildDir).toMatchFilesystemSnapshot();
});

it("build piral", async () => {
    const info = await execute(`
        rm -rf piral-inst &&
        mkdir piral-inst &&
        cd piral-inst &&
        npm init piral-instance -y &&
        npm list > package.list &&
        rm -rf node_modules
    `);

    expect(info.stderr).toBe("");

    const pathToBuildDir = path.resolve(process.cwd(), "piral-inst");
    expect(pathToBuildDir).toMatchFilesystemSnapshot();
});
