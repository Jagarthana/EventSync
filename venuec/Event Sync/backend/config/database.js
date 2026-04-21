const mongoose = require('mongoose');
const { mongoUri } = require('./env');

function printMongoHelp() {
  console.error('');
  console.error('MongoDB is not reachable. Fix one of the following:');
  console.error('  • Start MongoDB on this machine (Windows: Services → MongoDB, or install MongoDB Community).');
  console.error('  • Or run Docker from the backend folder:  docker compose up -d');
  console.error('  • Or set MONGO_URI in backend/.env to a MongoDB Atlas connection string.');
  console.error('');
}

async function connectDb() {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      maxPoolSize: 10,
    });
  } catch (err) {
    printMongoHelp();
    throw err;
  }
  return mongoose.connection;
}

async function disconnectDb() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

module.exports = { connectDb, disconnectDb, mongoose };
