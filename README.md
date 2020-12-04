# piral CLI acceptance tests

## following steps need to be tested

### piral

-   ✅ Scaffold Piral instance
-   ✅ Run/debug Piral instance
-   Build Piral instance
-   ✅ Validate Piral instance (through snapshot compare)
-   Use Piral instance emulator for scaffolding locally
-   Change Piral instance while debugging (HMR)
-   Check Piral instance with browser extension (piral-inspector)

### pilet

-   ✅ Scaffold pilet (using sample-piral with next)
-   ✅ Run/debug new pilet
-   Build pilet
-   Publish pilet (to temp. feed) pilet publish --api-key {key} --url https://feed.piral.cloud/api/v1/pilet/temp --fresh
-   ✅ Validate pilet (through snapshot compare)
-   ✅ Change pilet while debugging (HMR)
-   Check pilet with browser extension (piral-inspector)

## additinal dimension to be tested

-   other OS (Windows/Max)
-   other package managment tools (npm/yarn)
-   other node versions (since the lastest LTS)
-   upgrade different piral instances to current version
