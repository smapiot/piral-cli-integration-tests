/**
 * copied from https://github.com/vlad-zhukov/jest-fs-snapshot
 * added support for custom compare function
 */

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

function _interopDefault(ex) {
    return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
}

var path = _interopDefault(require("path"));
var fs = _interopDefault(require("fs"));
var asar = _interopDefault(require("asar"));
var asarDisk = _interopDefault(require("asar/lib/disk"));
var isValidUTF8 = _interopDefault(require("utf-8-validate"));
var iconv = _interopDefault(require("iconv-lite"));
var diff = _interopDefault(require("jest-diff"));
var constants = require("jest-diff/build/constants");
var jestMatcherUtils = require("jest-matcher-utils");
var filenamify = _interopDefault(require("filenamify"));

function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;

    for (i = 0; i < sourceKeys.length; i++) {
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        target[key] = source[key];
    }

    return target;
}

function getDirectoryTree(src, options = {}) {
    const stats = fs.lstatSync(src);

    if (options.callback) {
        options.callback(path.resolve(src), stats);
    }

    if (stats.isDirectory()) {
        const files = fs.readdirSync(src).reduce((res, child) => {
            if (!(options.exclude && options.exclude.test(child))) {
                res[child] = getDirectoryTree(path.resolve(src, child), options);
            }

            return res;
        }, {});
        return {
            files,
        };
    }

    if (stats.isFile()) {
        return {
            size: stats.size,
        };
    }

    return {};
}

function getNodeType(node, pathToNode) {
    if (typeof node === "object") {
        if (typeof node.files === "object") return "directory";
        if (typeof node.size === "number") return "file";
        if (typeof node.link === "string") return "symlink";
    }

    throw new Error(`Unknown node type '${JSON.stringify(node)}' at ${pathToNode}.`);
}

const ROOT = "./";
function compareDirectoryTrees({ actual, expected, pathToNode = ROOT, onFile }) {
    const actualType = getNodeType(actual, pathToNode);
    const expectedType = getNodeType(expected, pathToNode);

    if (pathToNode === ROOT && (actualType !== "directory" || expectedType !== "directory")) {
        throw new Error(`The roots must be directories but got a ${actualType} and a ${expectedType}.`);
    }

    if (actualType !== expectedType) {
        throw new Error(`Nodes at '${pathToNode}' have different types: a ${actualType} and a ${expectedType}.`);
    }

    if (actualType === "file") {
        if (onFile) {
            onFile({
                actual,
                expected,
                pathToNode,
            });
            return null;
        }

        if (actual.size !== expected.size) {
            throw new Error(`Files at '${pathToNode}' have different size: ${actual.size} and ${expected.size}.`);
        }
    }

    if (actualType === "directory") {
        const actualKeys = Object.keys(actual.files);
        const expectedKeys = Object.keys(expected.files);

        for (let i = 0, l = actualKeys.length; i < l; i++) {
            const key = actualKeys[i];
            const bKeyIndex = expectedKeys.indexOf(key);

            if (bKeyIndex === -1) {
                throw new Error(
                    `Directories at ${pathToNode} are different: expected directory doesn't have a node '${key}'.`
                );
            }

            expectedKeys.splice(bKeyIndex, 1);
        }

        if (expectedKeys.length > 0) {
            throw new Error(
                `Directories at ${pathToNode} are different: actual directory doesn't have node(s) '${expectedKeys.join(
                    "', '"
                )}'.`
            );
        }

        actualKeys.forEach((key) => {
            compareDirectoryTrees({
                actual: actual.files[key],
                expected: expected.files[key],
                pathToNode: pathToNode + (pathToNode !== ROOT ? "/" : "") + key,
                onFile,
            });
        });
    }

    return null;
}

function getAsarTree(archive) {
    return asarDisk.readArchiveHeaderSync(archive).header;
}
function createAsarPackage(src, dest, _ref = {}) {
    let { exclude } = _ref,
        options = _objectWithoutPropertiesLoose(_ref, ["exclude"]);

    const files = [];
    const metadata = {};

    function callback(path$$1, stat) {
        let type;

        if (stat.isDirectory()) {
            type = "directory";
        }

        if (stat.isFile()) {
            type = "file";
        }

        if (stat.isSymbolicLink()) {
            type = "symbolic";
        }

        if (!type) {
            throw new Error("ataatt");
        }

        files.push(path$$1);
        metadata[path$$1] = {
            type,
            stat,
        };
    }

    getDirectoryTree(src, {
        exclude,
        callback,
    });
    return new Promise((resolve, reject) => {
        asar.createPackageFromFiles(src, dest, files, metadata, options, (err) => (err ? reject(err) : resolve()));
    });
}

function getBufferEncoding(buffer) {
    const size = buffer.length;

    if (size === 0) {
        return "utf8";
    } // UTF-8 BOM

    if (size >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
        return "utf8";
    } // UTF-16 BE BOM

    if (size >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
        return "utf16-be";
    } // UTF-16 LE BOM

    if (size >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
        return "utf16";
    }

    if (isValidUTF8(buffer)) {
        return "utf8";
    }

    return "binary";
}
function compareBuffers(actualBuf, expectedBuf) {
    const actualEncoding = getBufferEncoding(actualBuf);
    const expectedEncoding = getBufferEncoding(expectedBuf);

    if (actualEncoding !== expectedEncoding) {
        return (
            ` Comparing files with different encodings. Expected ${jestMatcherUtils.EXPECTED_COLOR(expectedEncoding)}` +
            ` but received ${jestMatcherUtils.RECEIVED_COLOR(actualEncoding)}.`
        );
    }

    if (actualEncoding === "binary") {
        return Buffer.compare(actualBuf, expectedBuf) === 0
            ? constants.NO_DIFF_MESSAGE
            : "Comparing different binary files.";
    }

    const actualText = iconv.decode(actualBuf, actualEncoding);
    const expectedText = iconv.decode(expectedBuf, expectedEncoding);
    return diff(actualText, expectedText);
}
function compareDirectoryToAsar(actualPath, expectedPath, options) {
    try {
        const actualTree = getDirectoryTree(actualPath, options);
        const expectedTree = getAsarTree(expectedPath);
        const asarFilesystem = asarDisk.readFilesystemSync(expectedPath);
        compareDirectoryTrees({
            actual: actualTree,
            expected: expectedTree,

            onFile({ pathToNode }) {
                if (path.sep === "\\") {
                    // eslint-disable-next-line no-param-reassign
                    pathToNode = pathToNode.replace(/[/]/g, "\\");
                }

                const thisPath = path.resolve(actualPath, pathToNode);

                const actual = fs.readFileSync(thisPath);
                const expected = asarDisk.readFileSync(asarFilesystem, pathToNode, asarFilesystem.getFile(pathToNode));

                let compareFunc = compareBuffers;

                if (options.customCompare) {
                    const match = options.customCompare.filter(({ check }) => check(thisPath))[0];
                    if (match) compareFunc = match.compare || compareFunc;
                }

                const res = compareFunc(actual, expected);

                if (res !== constants.NO_DIFF_MESSAGE) {
                    const error = new Error(res);
                    error.pathToNode = pathToNode;
                    throw error;
                }
            },
        });
    } catch (error) {
        return error;
    }

    return null;
}

function matchFilesystemSnapshot({ received, expected, context, name, options = {} }) {
    const { testPath, currentTestName, isNot, snapshotState } = context;

    if (isNot) {
        throw new Error("Jest: `.not` cannot be used with `.toMatchFilesystemSnapshot()`.");
    }

    if (!snapshotState) {
        throw new Error("Jest: snapshot state must be initialized.");
    }

    const typeOfReceived = typeof received;

    if (typeOfReceived !== "string") {
        throw new Error(`Jest: expected to receive a path to a directory but got ${typeOfReceived}.`);
    }

    const count = Number(snapshotState._counters.get(currentTestName) || 0);
    const testKey = `${path.basename(testPath)} ${currentTestName} ${count}`;
    const snapshotFilename = `${filenamify(testKey)}.snap.asar`;
    const snapshotsDir = path.resolve(testPath, "..", "__fs_snapshots__");
    const typeOfExpected = typeof expected;
    let expectedFullPath = expected;

    if (typeOfExpected === "undefined") {
        expectedFullPath = path.resolve(snapshotsDir, snapshotFilename);
    } else if (typeOfExpected !== "string") {
        throw new Error(`Jest: a matcher expected a path to a snapshot but got ${typeOfExpected}.`);
    }

    const receivedFullPath = path.resolve(received);

    if (!fs.existsSync(receivedFullPath)) {
        throw new Error(`Jest: expected path \`${received}\` doesn't exists.`);
    }

    const hasSnapshot = fs.existsSync(expectedFullPath);

    if (!hasSnapshot) {
        if (snapshotState._updateSnapshot === "none") {
            return {
                name,
                pass: false,
                report: () =>
                    `New snapshot was ${jestMatcherUtils.RECEIVED_COLOR("not written")}. The update flag ` +
                    `must be explicitly passed to write a new snapshot.\n\n` +
                    `This is likely because this test is run in a continuous integration ` +
                    `(CI) environment in which snapshots are not written by default.`,
            };
        }

        createAsarPackage(receivedFullPath, expectedFullPath, {
            exclude: /node_modules/,
        });
        snapshotState.added += 1;
        return {
            name,
            pass: true,
            message: () => "",
        };
    }

    const diffMessage = compareDirectoryToAsar(receivedFullPath, expectedFullPath, {
        exclude: /node_modules/,
        aAnnotation: "Snapshot",
        bAnnotation: "Received",
        expand: snapshotState.expand,
        customCompare: options.customCompare,
    });

    if (!diffMessage) {
        snapshotState.matched += 1;

        snapshotState._uncheckedKeys.delete(snapshotFilename);

        return {
            name,
            pass: true,
            message: () => "",
        };
    }

    if (snapshotState._updateSnapshot === "all") {
        createAsarPackage(receivedFullPath, expectedFullPath, {
            exclude: /node_modules/,
        });
        snapshotState.updated += 1;

        snapshotState._uncheckedKeys.delete(snapshotFilename);

        return {
            name,
            pass: true,
            message: () => "",
        };
    }

    snapshotState.unmatched += 1;

    snapshotState._uncheckedKeys.delete(snapshotFilename);

    const report = () =>
        `${jestMatcherUtils.RECEIVED_COLOR("Received value")} does not match ${jestMatcherUtils.EXPECTED_COLOR(
            `stored snapshot${diffMessage.pathToNode ? ` at ${diffMessage.pathToNode}` : ""}`
        )}.\n\n ${diffMessage.message}`;

    return {
        name,
        pass: false,
        message: () => `${jestMatcherUtils.matcherHint(`.${name}`, "value", "")}\n\n${report()}`,
        report,
    };
}

function toMatchFilesystemSnapshot(received, expected, options) {
    return matchFilesystemSnapshot({
        received,
        expected,
        context: this,
        name: "toMatchFilesystemSnapshot",
        options,
    });
}

exports.toMatchFilesystemSnapshot = toMatchFilesystemSnapshot;
//# sourceMappingURL=jest-fs-snapshot.cjs.js.map
