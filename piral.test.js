const { toMatchFilesystemSnapshot } = require("jest-fs-snapshot");
const path = require("path");
const { exec } = require("child_process");
const fs = require("fs");
const { promisify } = require("util");
const rimraf = promisify(require("rimraf"));

const execute = promisify(exec);
const fsPromises = fs.promises;
fsPromises.rm = fsPromises.rm || promisify(fs.unlink);
expect.extend({ toMatchFilesystemSnapshot });

const cliVersion = process.env.CLI_VERSION || "latest";
const installFlag = process.version.startsWith("v15")
  ? "--legacy-peer-deps -- "
  : "";

jest.setTimeout(120 * 1000); // 60 second timeout

describe("piral", () => {
  it("scaffold piral", async () => {
    // TODO: npm list | tail -n +2 > package.list &&

    await rimraf("piral-inst");
    await fsPromises.mkdir("piral-inst");

    const info = await execute(
      `npm init piral-instance@${cliVersion} ${installFlag}--tag ${cliVersion} -y`,
      {
        cwd: path.resolve(process.cwd(), "piral-inst"),
      }
    );

    await rimraf(path.resolve("piral-inst", "node_modules"));
    await fsPromises.rm(path.resolve("piral-inst", "package-lock.json"));

    expect(info.stderr).toBe("");

    const pathToBuildDir = path.resolve(process.cwd(), "piral-inst");
    expect(pathToBuildDir).toMatchFilesystemSnapshot();
  });
});
