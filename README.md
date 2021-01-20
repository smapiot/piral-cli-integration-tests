[![Piral Logo](https://github.com/smapiot/piral/raw/master/docs/assets/logo.png)](https://piral.io)

# Piral CLI Acceptance Tests

Integration tests for the `piral-cli` tool and imported plugins such as `piral-cli-parcel` or `piral-cli-webpack`.

## Status

[![Overall](https://smapiot.visualstudio.com/piral-pipelines/_apis/build/status/smapiot.piral-cli-integration-tests?branchName=master)](https://smapiot.visualstudio.com/piral-pipelines/_build/latest?definitionId=46&branchName=master)

| OS      | Node | Status                                                                                                                                                                                                                                                                                         |
| ------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Linux   | 10.x | [![Build Status](https://smapiot.visualstudio.com/piral-pipelines/_apis/build/status/smapiot.piral-cli-integration-tests?branchName=master&jobName=Job&configuration=Job%20linux_node_10)](https://smapiot.visualstudio.com/piral-pipelines/_build/latest?definitionId=46&branchName=master)   |
| Linux   | 12.x | [![Build Status](https://smapiot.visualstudio.com/piral-pipelines/_apis/build/status/smapiot.piral-cli-integration-tests?branchName=master&jobName=Job&configuration=Job%20linux_node_12)](https://smapiot.visualstudio.com/piral-pipelines/_build/latest?definitionId=46&branchName=master)   |
| Linux   | 14.x | [![Build Status](https://smapiot.visualstudio.com/piral-pipelines/_apis/build/status/smapiot.piral-cli-integration-tests?branchName=master&jobName=Job&configuration=Job%20linux_node_14)](https://smapiot.visualstudio.com/piral-pipelines/_build/latest?definitionId=46&branchName=master)   |
| Linux   | 15.x | [![Build Status](https://smapiot.visualstudio.com/piral-pipelines/_apis/build/status/smapiot.piral-cli-integration-tests?branchName=master&jobName=Job&configuration=Job%20linux_node_15)](https://smapiot.visualstudio.com/piral-pipelines/_build/latest?definitionId=46&branchName=master)   |
| Windows | 14.x | [![Build Status](https://smapiot.visualstudio.com/piral-pipelines/_apis/build/status/smapiot.piral-cli-integration-tests?branchName=master&jobName=Job&configuration=Job%20windows_node_14)](https://smapiot.visualstudio.com/piral-pipelines/_build/latest?definitionId=46&branchName=master) |

## Tests

### Piral

-   ✅ Scaffold Piral instance
-   ✅ Run/debug Piral instance
-   ✅ Build Piral instance
-   ✅ Validate Piral instance (through snapshot compare)
-   ✅ Use Piral instance emulator for scaffolding locally
-   ✅ Change Piral instance while debugging (HMR)
-   🔲 Upgrade Piral instance from older (0.12.0 -> ENV) to recent version
-   ⏸️ Check Piral instance with browser extension (piral-inspector)

### Pilet

-   ✅ Scaffold pilet (using sample-piral with next)
-   ✅ Run/debug new pilet
-   ✅ Build pilet
-   🔲 Publish pilet (to temp. feed) pilet publish --api-key {key} --url https://feed.piral.cloud/api/v1/pilet/temp --fresh
    -   https://github.com/smapiot/sample-pilet-service
-   ✅ Validate pilet (through snapshot compare)
-   ✅ Change pilet while debugging (HMR)
-   ⏸️ Check pilet with browser extension (piral-inspector)

## Enviroment variables

| ENV           | description   | default    |
| ------------- | ------------- | ---------- |
| `CLI_VERSION` | piral version | `"latest"` |

## License

Piral is released using the MIT license. For more information see the [license file](./LICENSE).
