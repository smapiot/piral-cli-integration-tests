const { toMatchFilesystemSnapshot } = require("jest-fs-snapshot");
const path = require("path");
const { exec } = require("child_process");
const fs = require("fs");
const { promisify } = require("util");

const execute = promisify(exec);
const fsPromises = fs.promises;
fsPromises.rm = fsPromises.rm || promisify(fs.unlink);

expect.extend({ toMatchFilesystemSnapshot });
jest.setTimeout(120 * 1000); // 60 second timeout

describe("piral", () => {
    it("scaffold piral", async () => {
        // TODO: npm list | tail -n +2 > package.list &&

        await fsPromises.rmdir("piral-inst", { recursive: true });
        await fsPromises.mkdir("piral-inst");

        const info = await execute(`npm init piral-instance -y`, {
            cwd: path.resolve(process.cwd(), "piral-inst"),
        });

        await fsPromises.rmdir(path.resolve("piral-inst", "node_modules"), { recursive: true });
        await fsPromises.rm(path.resolve("piral-inst", "package-lock.json"));

        expect(info.stderr).toBe("");

        const pathToBuildDir = path.resolve(process.cwd(), "piral-inst");
        expect(pathToBuildDir).toMatchFilesystemSnapshot();
    });
});
