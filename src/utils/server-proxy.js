const { runApp } = require('sample-pilet-service');

let server;

process.on('message', ({ type, ...args }) => {
  switch (type) {
    case 'start':
      server = runApp({ port: args.port, apiKeys: [args.apiKey] });
      server.once('listening', () => {
        process.send('started');
      });
      break;
    case 'stop':
      server.close(() => {
        process.send('stopped');
      });
      break;
  }
});
