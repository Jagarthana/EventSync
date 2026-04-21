const { Activity } = require('../models');
const { leanPlain } = require('../utils/transform');
const { localeDateTimeString } = require('../utils/date');

async function listActivity() {
  const rows = await Activity.find().sort({ _id: -1 }).lean();
  return rows.map(leanPlain);
}

async function createActivity(body) {
  const b = body || {};
  const row = {
    message: b.message,
    time: localeDateTimeString(),
  };
  const created = await Activity.create(row);
  return leanPlain(created);
}

module.exports = { listActivity, createActivity };
