const { Maintenance } = require('../models');
const { rid } = require('../utils/id');
const { maintenanceToClient } = require('../utils/transform');
const { localeDateTimeString } = require('../utils/date');

async function listMaintenance() {
  const rows = await Maintenance.find().lean();
  return rows.map((r) => maintenanceToClient(r));
}

async function createMaintenance(body) {
  const b = body || {};
  const reported = localeDateTimeString();
  const row = {
    maintId: rid('maint'),
    description: b.description,
    resource: b.resource || '',
    location: b.location || '',
    affectsEvent: b.affectsEvent || '',
    reported,
    reportedBy: 'Allocation Officer',
    status: 'open',
  };
  await Maintenance.create(row);
  return maintenanceToClient(row);
}

async function updateMaintenance(id, body) {
  const m = await Maintenance.findOne({ maintId: id });
  if (!m) {
    const e = new Error('Issue not found');
    e.status = 404;
    throw e;
  }
  const b = body || {};
  Object.assign(m, b);
  if (b.status === 'resolved' && !m.resolvedAt) {
    m.resolvedAt = localeDateTimeString();
  }
  await m.save();
  return maintenanceToClient(m);
}

module.exports = { listMaintenance, createMaintenance, updateMaintenance };
