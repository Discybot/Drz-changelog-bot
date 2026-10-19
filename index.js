require('dotenv').config();
const { loadConfig, configProblems } = require('./src/config');
const { ChangelogStore } = require('./src/store');
const { createBot } = require('./src/bot');
const { createApp } = require('./src/api');

const config = loadConfig();
const problems = configProblems(config);
if (problems.length) {
  console.error('Cannot start. Fix your .env:\n - ' + problems.join('\n - '));
  process.exit(1);
}

const store = new ChangelogStore(config.dataFile);
const bot = createBot(config, store);
const app = createApp({ store, discord: bot.discord, config });

const server = app.listen(config.port, () => {
  console.log(`API + website listening on http://localhost:${config.port}`);
});

bot.start().catch((err) => {
  console.error('Discord login failed:', err.message);
  process.exit(1);
});

function shutdown() {
  console.log('Shutting down...');
  server.close();
  bot.stop();
  process.exit(0);
}
process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err));
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
