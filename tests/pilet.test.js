const path = require("path");
const { spawn } = require("child_process");
const { exec } = require('child_process');

const { toMatchFilesystemSnapshot } = require("jest-fs-snapshot");
const { cleanDir, cleanupForSnapshot, snapshotOptions, execute, sleep } = require("../src/common");
const { doesNotMatch } = require("assert");

const cliVersion = process.env.CLI_VERSION || "latest";
const installFlag = process.version.startsWith("v15") ? "-y --legacy-peer-deps -- " : "";

// const testFeedUrl = "https://feed.piral.cloud/api/v1/pilet/temp";
const testFeedUrl = "http://localhost:9000/api/v1/pilet";

const testFeedKey = "df133a512569cbc85f69788d1b7ff5a909f6bcfe1c9a2794283a2fc35175882c";

jest.setTimeout(300 * 1000); // 300 second timeout
expect.extend({ toMatchFilesystemSnapshot });

describe("pilet", () => {
    // it("scaffold pilet", async () => {
    //     const pathToBuildDir = path.resolve(process.cwd(), "pilet-build");
    //     await cleanDir(pathToBuildDir);

    //     const info = await execute(`npm init pilet@${cliVersion} ${installFlag} -y`, {
    //         cwd: pathToBuildDir,
    //     });

    //     await cleanupForSnapshot(pathToBuildDir);

    //     expect(info.stderr).toBe("");

    //     expect(pathToBuildDir).toMatchFilesystemSnapshot(undefined, snapshotOptions);
    // });

    // it("pilet scaffold with piral source", async () => {
    //     const pathToBuildDir = path.resolve(process.cwd(), "pilet");
    //     await cleanDir(pathToBuildDir);

    //     // scaffold new pilet
    //     const info = await execute(
    //         `npm init pilet@${cliVersion} ${installFlag}--source sample-piral@${cliVersion} -y`,
    //         {
    //             cwd: pathToBuildDir,
    //         }
    //     );
    //     expect(info.stderr).toBe("");
    // });

    it("pilet publish", async (done) => {
        const pathToBuildDir = path.resolve(process.cwd(), "pilet");
        const port = 9000;
        const testFeedUrl = `http://localhost:${port}/api/v1/pilet`;

        const localFeedService = spawn(`npm run sample-feed`, {
            cwd: pathToBuildDir,
            shell: true
        });
        localFeedService.stdout.once("data", x => console.log(x.toString()));
        localFeedService.stderr.once("data", x => console.log("feed-err", x.toString()));

        // const info = await execute(
        //     `npx pilet publish --fresh --url ${testFeedUrl} --api-key ${testFeedKey}`,
        //     {
        //         cwd: pathToBuildDir
        //     }
        // );

        await sleep(20000);

        
        const publish = new Promise((res, rej) => {
            exec(`npx pilet publish --fresh --url ${testFeedUrl} --api-key ${testFeedKey}`,
            {
                cwd: pathToBuildDir
            }, (error, stdout, stderr) => {
                if(error)
                    rej({error, stdout, stderr})    
                else
                    res({stdout, stderr})
            });
        })
         
        let info;
        await publish.then((success)=> {
            info = success;
        }).catch((err) => {
            info = err;
            console.log(err.stdout);
            console.log(err.stderr);
        })
        //expect(info.error).toBe(undefined);
        console.log(info.stdout);

        sleep(20000).then(() => {
            localFeedService.kill("SIGTERM");
            localFeedService.stdout.destroy();
            localFeedService.stderr.destroy();
            done();
        })

        //console.log(info);
        
        // const debugProcess = spawn(`npx pilet publish --fresh --url ${testFeedUrl} --api-key ${testFeedKey}`, {
        //     cwd: pathToBuildDir,
        //     shell: true
        // });

        // debugProcess.stdin.pause();
        
        // while(!debugProcess.stdout.destroyed) {

        //     debugProcess.stdout.on('data', (data) => {
        //         if(data.contains("fail", caseIrrelevant)) {

        //         }
        //     })
        // }

        // setTimeout(() => {
        //     debugProcess.stdin.pause();
        //     debugProcess.kill("SIGTERM");
        //     debugProcess.stdout.destroy();
        //     debugProcess.stderr.destroy();
        // }, 20000);

        //localFeedService.stdin.pause();
        // localFeedService.kill("SIGTERM");
        // localFeedService.stdout.destroy();
        // localFeedService.stderr.destroy();

        // http.get({
        //     hostname: 'localhost',
        //     port: 80,
        //     path: '/',
        //     agent: false  // Create a new agent just for this one request
        //   }, (res) => {
        //     // Do stuff with response
        //   });
          
        //expect(info.stderr).toBe("");

        //use spawn to precise CI console output
        //use local feed service
    });
});
