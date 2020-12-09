const path = require("path");
const { exec, spawn } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const { toMatchFilesystemSnapshot } = require("jest-fs-snapshot");
const rimraf = promisify(require("rimraf"));
const { type } = require("os");

const execute = promisify(exec);
const sleep = promisify(setTimeout);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
expect.extend({ toMatchFilesystemSnapshot });
const fsPromises = fs.promises;
fsPromises.rm = fsPromises.rm || promisify(fs.unlink);

const srcFilePath = path.resolve(process.cwd(), "pilet", "src", "index.tsx");
const timeoutCommand = type().startsWith("Linux") ? "timeout 60s " : "";

jest.setTimeout(300 * 1000); // 300 second timeout

const serverHasStarted = (resolve, port, timeout, ref) => (data) => {
    if (data.toString().includes(`Running at http://localhost:${port}`)) {
        clearTimeout(timeout);
        ref.unsubscribe();
        resolve();
    }
};

const waitForRunning = (debugProcess, port) => {
    return new Promise((resolve, reject) => {
        timeout = setTimeout(() => reject(new Error("Server not started after 60s")), 60 * 1000);
        const ref = {};
        const onData = serverHasStarted(resolve, port, timeout, ref);
        debugProcess.stdout.on("data", onData);
        ref.unsubscribe = () => debugProcess.stdout.off("data", onData);
    });
};

describe("pilet", () => {
    it("scaffold pilet", async () => {
        // TODO: npm list | tail -n +2 > package.list &&
        await rimraf("pilet-build");
        await fsPromises.mkdir("pilet-build");

        const info = await execute(`npm init pilet ${process.version.startsWith("v15") ? "-- " : ""}-y`, {
            cwd: path.resolve(process.cwd(), "pilet-build"),
        });

        await rimraf(path.resolve("pilet-build", "node_modules"));
        await rimraf(path.resolve("pilet-build", "package-lock.json"));

        expect(info.stderr).toBe("");

        const pathToBuildDir = path.resolve(process.cwd(), "pilet-build");
        expect(pathToBuildDir).toMatchFilesystemSnapshot();
    });

    it("pilet scaffold with piral source", async () => {
        await rimraf("pilet");
        await fsPromises.mkdir("pilet");

        // scaffold new pilet
        const info = await execute(
            `npm init pilet@next ${process.version.startsWith("v15") ? "-- " : ""}--source sample-piral@next -y`,
            {
                cwd: path.resolve(process.cwd(), "pilet"),
            }
        );
        expect(info.stderr).toBe("");
    });

    it("HMR", async (done) => {
        const port = 38080;

        // start the debug process and wait until compiled and server running
        const debugProcess = spawn(
            `${timeoutCommand}npx pilet debug ${process.version.startsWith("v15") ? "-- " : ""}--port ${port}`,
            {
                cwd: path.resolve(process.cwd(), "pilet"),
                shell: true,
            }
        );
        const handleError = jest.fn();
        debugProcess.stderr.once("data", handleError);
        await waitForRunning(debugProcess, port);

        // Go to page and check for expected pilet
        await page.goto(`http://localhost:${port}`, { waitUntil: "networkidle0" });
        let innerHtml = await page.$eval(".pi-tile", (element) => {
            return element.children[0].innerHTML;
        });
        expect(innerHtml).toBe("Welcome to Piral!");

        // Will be resolved 1s after the dev server has recompiled the changes
        const backendReloaded = new Promise((resolve, reject) => {
            timeout = setTimeout(() => reject(new Error("Server not started after 60s")), 60 * 1000);
            debugProcess.stdout.once("data", () => {
                clearTimeout(timeout);
                resolve();
            });
        }).then(() => sleep(1000));

        // Update in src/index.tsx to trigger HMR
        const newString = `Welcome to Test${Math.floor(Math.random() * 10000)}!`;
        const indexFile = await readFile(srcFilePath);
        await writeFile(srcFilePath, indexFile.toString().replace("Welcome to Piral!", newString));

        // Wait until changes have been applied and check the updated pilet
        await backendReloaded;
        innerHtml = await page.$eval(".pi-tile", (element) => {
            return element.children[0].innerHTML;
        });
        expect(innerHtml).toBe(newString);

        // Validate, that the debug process did not output any errors and terminate the process
        expect(handleError).not.toBeCalled();
        debugProcess.kill("SIGTERM");
        debugProcess.stdout.destroy();
        debugProcess.stderr.destroy();

        done();
    });
});
