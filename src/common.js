const path = require("path");
const { exec } = require("child_process");
const fs = require("fs");
const { promisify } = require("util");

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
                return diff(actual, expected);
            },
        },
    ],
};

module.exports = {
    execute,
    cleanDir,
    cleanupForSnapshot,
    getInitializerOptions,
    snapshotOptions,
};
