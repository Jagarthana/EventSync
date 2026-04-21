const { Equipment } = require('../models');
const { rid } = require('../utils/id');
const { leanPlain } = require('../utils/transform');

async function listEquipment() {
  const rows = await Equipment.find().lean();
  return rows.map(leanPlain);
}

async function createEquipment(body) {
  const b = body || {};
  const name = b.equipmentName || b.resourceName;
  const total = b.total != null && b.total !== '' ? Number(b.total) : 1;
  const available = b.available != null && b.available !== '' ? Number(b.available) : total;
  const row = {
    equipmentId: rid('eq'),
    equipmentName: name,
    category: b.category || '',
    total,
    available,
    inUse: Number(b.inUse) || 0,
    underMaintenance: Number(b.underMaintenance) || 0,
    quantity: available,
    status: b.status || 'available',
    cost: Number(b.cost) || 0,
  };
  await Equipment.create(row);
  return row;
}

async function updateEquipment(equipmentId, body) {
  const e = await Equipment.findOne({ equipmentId });
  if (!e) {
    const err = new Error('Equipment not found');
    err.status = 404;
    throw err;
  }
  Object.assign(e, body || {});
  await e.save();
  return leanPlain(e);
}

async function removeEquipment(equipmentId) {
  const r = await Equipment.deleteOne({ equipmentId });
  if (r.deletedCount === 0) {
    const err = new Error('Equipment not found');
    err.status = 404;
    throw err;
  }
  return null;
}

module.exports = { listEquipment, createEquipment, updateEquipment, removeEquipment };
