require('./config/env');
const { port, mongoUri } = require('./config/env');
const app = require('./app');
const { connectDb, disconnectDb, mongoose } = require('./config/database');
const { ensureSeeded } = require('./scripts/seedDatabase');
const { getMongoDisplayHost } = require('./utils/mongoHost');

async function start() {
  await connectDb();
  await ensureSeeded();

  const server = app.listen(port, () => {
    const dbHost = getMongoDisplayHost(mongoose, mongoUri);
    console.log(`🚀 Server running on port ${port}`);
    console.log(`🌐 http://localhost:${port}`);
    console.log(`✅ MongoDB Connected: ${dbHost}`);
  });

  const shutdown = (signal) => {
    console.log(`\n${signal} received, closing…`);
    server.close(async () => {
      try {
        await disconnectDb();
      } catch (e) {
        console.error(e);
      }
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
