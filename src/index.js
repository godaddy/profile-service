const mongoose = require('mongoose');
const app = require('./app');
const sanitize = require('mongo-sanitize');
const profileMonitor = require('./profileMonitor');
let server;

function start(opts) {
  const host = process.env.PROFILE_MONGOHOST || opts.host || 'localhost'; // eslint-disable-line no-process-env
  const db = process.env.PROFILE_MONGODB || opts.database || 'test'; // eslint-disable-line no-process-env
  const port = process.env.NODE_PORT || opts.port || 8080; // eslint-disable-line no-process-env
  const mongoDbUrl = `mongodb://${sanitize(host)}/${sanitize(db)}`;
  mongoose.connect(
    mongoDbUrl,
    {
      useNewUrlParser: true,
      reconnectTries: Number.MAX_VALUE,
      useUnifiedTopology: true
    }
  );
  server = app.listen(port);
  profileMonitor.start({ unlockProfileMs: opts.unlockProfileMs || 600000 });
}

function stop() {
  if (server) server.close();
}

module.exports = {
  start,
  stop
};

if (!module.parent) {
  start({});
}
