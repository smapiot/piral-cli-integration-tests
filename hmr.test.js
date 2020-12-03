const path = require("path");
const { exec, spawn } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");

const execute = promisify(exec);
const sleep = promisify(setTimeout);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const srcFilePath = path.resolve(process.cwd(), "pilet", "src", "index.tsx");

jest.setTimeout(120 * 1000); // 60 second timeout

const serverHasStarted = (resolve, port, timeout) => (data) => {
    if (data.toString().includes(`Running at http://localhost:${port}`)) {
        clearTimeout(timeout);
        resolve();
    }
};

const waitForRunning = (debugProcess, port) => {
    return new Promise((resolve, reject) => {
        timeout = setTimeout(() => reject(new Error("Server not started after 60s")), 60 * 1000);
        debugProcess.stdout.on("data", serverHasStarted(resolve, port, timeout));
    });
};

it("hmr pilet", async (done) => {
    const port = 2333;
    const info = await execute(`
        rm -rf pilet &&
        mkdir pilet &&
        cd pilet &&
        npm init pilet@next --source sample-piral@next -y
    `);

    expect(info.stderr).toBe("");

    const debugProcess = spawn(`timeout 60s npx pilet debug --port ${port}`, {
        cwd: path.resolve(process.cwd(), "pilet"),
        shell: true,
    });

    const handleError = jest.fn();
    debugProcess.stderr.once("data", handleError);
    // debugProcess.stderr.on("data", (x) => console.log(x.toString()));
    // debugProcess.stdout.on("data", (x) => console.log(x.toString()));

    await waitForRunning(debugProcess, port);

    await page.goto(`http://localhost:${port}`, { waitUntil: "networkidle0" });
    let innerHtml = await page.$eval(".pi-tile", (element) => {
        return element.children[0].innerHTML;
    });
    expect(innerHtml).toBe("Welcome to Piral!");

    const backendReloaded = new Promise((resolve, reject) => {
        timeout = setTimeout(() => reject(new Error("Server not started after 60s")), 60 * 1000);
        debugProcess.stdout.once("data", () => {
            clearTimeout(timeout);
            resolve();
        });
    }).then(() => sleep(1000));

    const newString = `Welcome to Test${Math.floor(Math.random() * 10000)}!`;

    const indexFile = await readFile(srcFilePath);
    await writeFile(srcFilePath, indexFile.toString().replace("Welcome to Piral!", newString));

    await backendReloaded;

    innerHtml = await page.$eval(".pi-tile", (element) => {
        return element.children[0].innerHTML;
    });

    expect(innerHtml).toBe(newString);

    expect(handleError).not.toBeCalled();

    debugProcess.kill("SIGTERM");
    debugProcess.stdout.destroy();
    debugProcess.stderr.destroy();

    done();
});
