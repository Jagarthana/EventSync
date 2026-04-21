const { PreEventChecklist } = require('../models');

async function getAllChecklists() {
  const rows = await PreEventChecklist.find().lean();
  const map = {};
  for (const r of rows) {
    map[r.bookingId] = r.checks || [];
  }
  return map;
}

async function putChecklist(bookingId, rawBody) {
  const checks = Array.isArray(rawBody) ? rawBody : rawBody?.checks;
  if (!Array.isArray(checks)) {
    const e = new Error('Expected checklist array');
    e.status = 400;
    throw e;
  }
  await PreEventChecklist.findOneAndUpdate(
    { bookingId },
    { bookingId, checks },
    { upsert: true, new: true }
  );
  return { bookingId, checks };
}

module.exports = { getAllChecklists, putChecklist };
