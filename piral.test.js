const path = require("path");
const diff = require("jest-diff");

const { toMatchFilesystemSnapshot } = require("jest-fs-snapshot");

const { cleanDir, cleanupForSnapshot, getInitializerOptions, execute } = require("./common");

const snapshotOptions = {
    customCompare: [
        [
            (path) => path.endsWith("package.json"),
            (actualBuffer, expectedBuffer) => {
                const actual = JSON.parse(actualBuffer);
                const expected = JSON.parse(expectedBuffer);
                return diff(actual, expected);
            },
        ],
    ],
};

expect.extend({ toMatchFilesystemSnapshot });

const cliVersion = process.env.CLI_VERSION || "latest";

jest.setTimeout(120 * 1000); // 60 second timeout

describe("piral", () => {
    it("scaffold piral", async () => {
        const pathToBuildDir = path.resolve(process.cwd(), "piral-inst");

        await cleanDir(pathToBuildDir);

        const info = await execute(`npm init piral-instance@${cliVersion} ` + getInitializerOptions(), {
            cwd: pathToBuildDir,
        });

        await cleanupForSnapshot(pathToBuildDir);

        expect(info.stderr).toBe("");

        expect(pathToBuildDir).toMatchFilesystemSnapshot();
    });
});
