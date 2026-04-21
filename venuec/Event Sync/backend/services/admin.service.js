const { seedDatabase } = require('../scripts/seedDatabase');

async function resetDemo() {
  await seedDatabase();
  return { ok: true };
}

module.exports = { resetDemo };
