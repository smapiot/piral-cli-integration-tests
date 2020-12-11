const path = require("path");
const { exec } = require("child_process");
const fs = require("fs");
const { promisify } = require("util");
const { type } = require("os");

const rimraf = promisify(require("rimraf"));
const diff = require("jest-diff");

const fsPromises = fs.promises;
fsPromises.rm = fsPromises.rm || promisify(fs.unlink);
const bundlerOption = !!process.env.BUNDLER ? ` --bundler ${process.env.BUNDLER} ` : "";

const execute = promisify(exec);

const cleanDir = async (dirPath) => {
    await rimraf(dirPath);
    await fsPromises.mkdir(dirPath);
};

const cleanupForSnapshot = async (dirPath) => {
    await rimraf(path.resolve(dirPath, "node_modules"));
    await fsPromises.rm(path.resolve(dirPath, "package-lock.json"));
};

const getInitializerOptions = () => {
    return [
        //
        process.version.startsWith("v15") ? "-y --legacy-peer-deps -- " : "",
        bundlerOption,
        "-y",
    ].join(" ");
};

const snapshotOptions = {
    customCompare: [
        {
            check: (path) => path.endsWith("package.json"),

            compare: (actualBuffer, expectedBuffer) => {
                const actual = JSON.parse(actualBuffer);
                const expected = JSON.parse(expectedBuffer);

                [
                    // delete piral cli dependencies
                    actual.dependencies,
                    actual.devDependencies,
                    expected.dependencies,
                    expected.devDependencies,
                ].forEach((obj) =>
                    Object.keys(obj)
                        .filter((key) => key.startsWith("piral-cli-"))
                        .forEach((key) => {
                            delete obj[key];
                        })
                );

                return diff(actual, expected);
            },
        },
    ],
};

const serverHasStarted = (resolve, port, timeout, ref) => (data) => {
    if (data.toString().includes(`Running at http://localhost:${port}`)) {
        clearTimeout(timeout);
        ref.unsubscribe();
        resolve();
    }
};

const waitForRunning = (debugProcess, port) => {
    return new Promise((resolve, reject) => {
        timeout = setTimeout(() => reject(new Error("Server not started after 180s")), 180 * 1000);
        const ref = {};
        const onData = serverHasStarted(resolve, port, timeout, ref);
        debugProcess.stdout.on("data", onData);
        ref.unsubscribe = () => debugProcess.stdout.off("data", onData);
    });
};

const timeoutCommand = type().startsWith("Linux") ? "timeout 60s " : "";

const sleep = promisify(setTimeout);

module.exports = {
    execute,
    cleanDir,
    cleanupForSnapshot,
    getInitializerOptions,
    snapshotOptions,
    waitForRunning,
    timeoutCommand,
    sleep,
};
