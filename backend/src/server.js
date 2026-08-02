const env = require('./config/env');
const app = require('./app');

app.listen(env.port, () => {
  console.log(`Ticket triage API listening on port ${env.port} (${env.nodeEnv})`);
});
