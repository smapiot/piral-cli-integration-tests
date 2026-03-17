[![Piral Logo](https://github.com/smapiot/piral/raw/main/docs/assets/logo.png)](https://piral.io)

# Piral CLI Acceptance Tests

Integration tests for the `piral-cli` tool and its default bundler. Can be used as a test bench when implementing a new bundler, too.

## Status

[![Overall](https://smapiot.visualstudio.com/piral-pipelines/_apis/build/status/smapiot.piral-cli-integration-tests?branchName=main)](https://smapiot.visualstudio.com/piral-pipelines/_build/latest?definitionId=46&branchName=main)

| OS           | Node   | Status       |
| ------------ | ------ | ------------ |
| Linux        | 16.x   | [![Build Status](https://smapiot.visualstudio.com/piral-pipelines/_apis/build/status/smapiot.piral-cli-integration-tests?branchName=main&jobName=Job&configuration=Job%20linux_node_16)](https://smapiot.visualstudio.com/piral-pipelines/_build/latest?definitionId=46&branchName=main)   |
| Linux        | 20.x   | [![Build Status](https://smapiot.visualstudio.com/piral-pipelines/_apis/build/status/smapiot.piral-cli-integration-tests?branchName=main&jobName=Job&configuration=Job%20linux_node_20)](https://smapiot.visualstudio.com/piral-pipelines/_build/latest?definitionId=46&branchName=main)   |
| Linux        | 21.x   | [![Build Status](https://smapiot.visualstudio.com/piral-pipelines/_apis/build/status/smapiot.piral-cli-integration-tests?branchName=main&jobName=Job&configuration=Job%20linux_node_21)](https://smapiot.visualstudio.com/piral-pipelines/_build/latest?definitionId=46&branchName=main)   |
| Windows      | 16.x   | [![Build Status](https://smapiot.visualstudio.com/piral-pipelines/_apis/build/status/smapiot.piral-cli-integration-tests?branchName=main&jobName=Job&configuration=Job%20windows_node_16)](https://smapiot.visualstudio.com/piral-pipelines/_build/latest?definitionId=46&branchName=main) |
| Windows      | 20.x   | [![Build Status](https://smapiot.visualstudio.com/piral-pipelines/_apis/build/status/smapiot.piral-cli-integration-tests?branchName=main&jobName=Job&configuration=Job%20windows_node_20)](https://smapiot.visualstudio.com/piral-pipelines/_build/latest?definitionId=46&branchName=main) |
| MacOS        | 16.x   | [![Build Status](https://smapiot.visualstudio.com/piral-pipelines/_apis/build/status/smapiot.piral-cli-integration-tests?branchName=main&jobName=Job&configuration=Job%20macos_node_16)](https://smapiot.visualstudio.com/piral-pipelines/_build/latest?definitionId=46&branchName=main) |
| MacOS        | 20.x   | [![Build Status](https://smapiot.visualstudio.com/piral-pipelines/_apis/build/status/smapiot.piral-cli-integration-tests?branchName=main&jobName=Job&configuration=Job%20macos_node_20)](https://smapiot.visualstudio.com/piral-pipelines/_build/latest?definitionId=46&branchName=main) |

## Important Links

* 🌍 [Website](https://piral.io/) - learn more about Piral
* 📖 [Documentation](https://docs.piral.io/) - everything to get started and master micro frontends
* 🉐 **Help translating Piral!** - making PRs in the [documentation branch](https://github.com/smapiot/piral/tree/documentation)
* 🐞 [Issue Tracker](https://github.com/smapiot/piral/issues) - report bugs or suggest new features
* 🗨  [Forums](https://stackoverflow.com/questions/tagged/piral) - use the community support on StackOverflow
* 👪 [Community Chat](https://discord.gg/kKJ2FZmK8t) - ask questions and provide answers in our Discord server

## Running the Tests

After you cloned the repository run:

```sh
npm i
```

or an alternative command using your favorite package manager.

Now you can try running all tests:

```sh
npm start
```

You can also run the tests from a specific file only:

```sh
npm start -- src/pilet-build.test.ts
```

If you are only interested in a single test (e.g., `'can build a standard templated v2 pilet from sample-piral'`) then run it via:

```sh
npm start -- src/pilet-build.test.ts -t 'can build a standard templated v2 pilet from sample-piral'
```

**Caution**: Tests that leverage the integrated browser (using the `page` variable) can only be run if the whole test suite (i.e., no `-t` is specified) is run.

For Ubuntu 18.04 and higher the system dependencies can get installed automatically. Many other systems may just work without any special dependencies:

```sh
npx playwright install-deps chromium
```

To ensure everything is working with the test browser we recommend also installing the [browsers from Playwright](https://playwright.dev/docs/cli#install-browsers) via the command line:

```sh
npx playwright install chromium
```

## Testing Package

[![npm version](https://img.shields.io/npm/v/@smapiot/piral-cli-integration-tests.svg?style=flat)](https://www.npmjs.com/package/@smapiot/piral-cli-integration-tests)

The tests are also available as a drop-in package to test bundler plugins. You can install it with:

```sh
npm i @smapiot/piral-cli-integration-tests
```

Then run the tests using

```sh
npx piral-cli-tests <your-bundler-name>
```

If you don't specify the bundler name then the current working directory's *package.json* will be used to infer it.

## Tests

### Piral

-   ✅ Scaffold Piral instance
-   ✅ Run/debug Piral instance
-   ✅ Build Piral instance release
-   ✅ Build Piral instance emulator
-   ✅ Build Piral instance emulator sources
-   ✅ Generate Piral instance declaration
-   ✅ Validate Piral instance
-   ✅ Use Piral instance emulator for scaffolding locally
-   ✅ Change Piral instance while debugging (HMR)
-   ✅ Upgrade Piral instance from older (0.12.0 -> ENV) to recent version
-   ✅ Check Piral instance with debugging API (e.g., for `piral-inspector`)

### Pilet

-   ✅ Scaffold pilet (using `sample-piral`)
-   ✅ Run/debug new pilet
-   ✅ Build `mf` pilet
-   ✅ Build `v3` pilet
-   ✅ Build `v2` pilet
-   ✅ Build `v1` pilet
-   ✅ Build `v0` pilet
-   ✅ Build standalone pilet
-   ✅ Build pilet manifest file
-   ✅ Publish pilet (to temp. feed)
-   ✅ Validate pilet
-   ✅ Change pilet while debugging (reinject pilet)
-   ⏸️ Upgrade pilet from older `sample-piral` to current
-   ✅ Check pilet with debugging API (e.g., for `piral-inspector`)

The publish pilet command uses:

```sh
pilet publish --api-key {key} --url https://feed.piral.cloud/api/v1/pilet/temp --fresh
```

It also can perform against a feed [hosted by the `sample-pilet-service`](https://github.com/smapiot/sample-pilet-service).

## Enviroment variables

| ENV                | Description                        | Default    |
| ------------------ | ---------------------------------- | ---------- |
| `CLI_VERSION`      | Version of the `piral-cli` package | `latest`   |
| `BUNDLER_PLUGIN`   | The name of the bundler to use     |            |
| `BUNDLER_FEATURES` | The features of the bundler plugin | *all*      |

Available features:

- `codegen`, can handle `*.codegen` files
- `splitting`, can handle `import()` calls with a new JS side-bundle
- `pilet.v0`, supports the `v0` schema
- `pilet.v1`, supports the `v1` schema
- `pilet.v2`, supports the `v2` schema
- `pilet.v3`, supports the `v3` schema
- `pilet.mf`, supports the `mf` schema
- `importmap.ref`, supports usage of an importmap
- `importmap.local`, supports local creation of importmap side-bundles
- `build.pilet`, supports building a pilet
- `build.piral`, supports building a Piral instance
- `debug.pilet`, supports debugging a pilet
- `debug.piral`, supports debugging a Piral instance
- `hmr`, supports hot module reloading (for Piral instances)

## License

Piral is released using the MIT license. For more information see the [license file](./LICENSE).
