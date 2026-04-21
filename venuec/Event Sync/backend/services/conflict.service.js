const { Conflict } = require('../models');
const { conflictToClient } = require('../utils/transform');

async function listConflicts() {
  const rows = await Conflict.find().lean();
  return rows.map((r) => conflictToClient(r));
}

async function updateConflict(id, body) {
  const c = await Conflict.findOne({ conflictId: id });
  if (!c) {
    const e = new Error('Conflict not found');
    e.status = 404;
    throw e;
  }
  Object.assign(c, body || {});
  await c.save();
  return conflictToClient(c);
}

module.exports = { listConflicts, updateConflict };
