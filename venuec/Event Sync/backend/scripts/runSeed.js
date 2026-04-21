require('../config/env');
const { connectDb } = require('../config/database');
const { seedDatabase } = require('./seedDatabase');

connectDb()
  .then(() => seedDatabase())
  .then(() => {
    console.log('Database seeded.');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
