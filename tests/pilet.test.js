const path = require("path");

const { toMatchFilesystemSnapshot } = require("jest-fs-snapshot");
const { cleanDir, cleanupForSnapshot, snapshotOptions, execute } = require("../src/common");

const cliVersion = process.env.CLI_VERSION || "latest";
const installFlag = process.version.startsWith("v15") ? "-y --legacy-peer-deps -- " : "";

const testFeedUrl = "https://feed.piral.cloud/api/v1/pilet/temp";
const testFeedKey = "df133a512569cbc85f69788d1b7ff5a909f6bcfe1c9a2794283a2fc35175882c";

jest.setTimeout(300 * 1000); // 300 second timeout
expect.extend({ toMatchFilesystemSnapshot });

describe("pilet", () => {
    it("scaffold pilet", async () => {
        const pathToBuildDir = path.resolve(process.cwd(), "pilet-build");
        await cleanDir(pathToBuildDir);

        const info = await execute(`npm init pilet@${cliVersion} ${installFlag} -y`, {
            cwd: pathToBuildDir,
        });

        await cleanupForSnapshot(pathToBuildDir);

        expect(info.stderr).toBe("");

        expect(pathToBuildDir).toMatchFilesystemSnapshot(undefined, snapshotOptions);
    });

    it("pilet scaffold with piral source", async () => {
        const pathToBuildDir = path.resolve(process.cwd(), "pilet");
        await cleanDir(pathToBuildDir);

        // scaffold new pilet
        const info = await execute(
            `npm init pilet@${cliVersion} ${installFlag}--source sample-piral@${cliVersion} -y`,
            {
                cwd: pathToBuildDir,
            }
        );
        expect(info.stderr).toBe("");
    });

    it("pilet publish", async () => {

        const pathToBuildDir = path.resolve(process.cwd(), "pilet");

        const info = await execute(
            `npx pilet publish --fresh --url ${testFeedUrl} --api-key ${testFeedKey}`,
            {
                cwd: pathToBuildDir
            }
        );

        expect(info.stderr).toBe("");
    });
});
