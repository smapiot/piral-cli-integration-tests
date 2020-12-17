const path = require("path");
const { spawn } = require("child_process");
const { type } = require("os");
const fs = require("fs");

const { toMatchFilesystemSnapshot } = require("../src/jest-fs-snapshot");

const fsPromises = fs.promises;

const { cleanDir, getInitializerOptions, execute, waitForRunning, timeoutCommand, sleep } = require("../src/common");

module.exports = ({ jest, expect, describe, it, afterAllHandlers }, cliVersion, bundler, port) => {
    expect.extend({ toMatchFilesystemSnapshot });

    const bundlerPrefix = !!bundler ? bundler + "-" : "";

    jest.setTimeout(300 * 1000); // 60 second timeout

    describe(`${bundlerPrefix}piral`, () => {
        it("HMR", async (done) => {
            const pathToBuildDir = path.resolve(process.cwd(), bundlerPrefix + "piral-inst");
            const layoutFilePath = path.resolve(pathToBuildDir, "src", "layout.tsx");

            await cleanDir(pathToBuildDir);

            const info = await execute(`npm init piral-instance@${cliVersion} ` + getInitializerOptions(bundler), {
                cwd: pathToBuildDir,
            });

            // fixing node15 issue
            if (process.version.startsWith("v15") && type().startsWith("Linux"))
                try {
                    await execute(`timeout 60s npx piral debug --port 2323`, {
                        cwd: pathToBuildDir,
                    });
                } catch (error) {}

            const debugProcess = spawn(`${timeoutCommand} npx piral debug --port ${port}`, {
                cwd: pathToBuildDir,
                shell: true,
            });
            afterAllHandlers.push(() => {
                debugProcess.kill("SIGTERM");
                debugProcess.stdout.destroy();
                debugProcess.stderr.destroy();
            });
            const handleError = jest.fn();
            debugProcess.stderr.once("data", handleError);
            await waitForRunning(debugProcess, port);

            // Go to page and check for expected pilet
            await page.goto(`http://localhost:${port}`, { waitUntil: "networkidle2" });
            await sleep(5 * 1000);

            let innerHtml = await page.$eval("h1", (element) => {
                return element.innerHTML;
            });
            expect(innerHtml).toBe("Hello, world!");

            const backendReloaded = new Promise((resolve, reject) => {
                timeout = setTimeout(() => reject(new Error("Server not started after 60s")), 60 * 1000);
                debugProcess.stdout.once("data", () => {
                    clearTimeout(timeout);
                    resolve();
                });
            }).then(() => sleep(5000));

            const newString = `Hello, Test${Math.floor(Math.random() * 10000)}!`;
            const layoutFile = await fsPromises.readFile(layoutFilePath);
            await fsPromises.writeFile(layoutFilePath, layoutFile.toString().replace("Hello, world!", newString));

            await backendReloaded;
            innerHtml = await page.$eval("h1", (element) => {
                return element.innerHTML;
            });
            expect(innerHtml).toBe(newString);

            expect(handleError).not.toBeCalled();
            debugProcess.kill("SIGTERM");
            debugProcess.stdout.destroy();
            debugProcess.stderr.destroy();

            done();
        });
    });
};
