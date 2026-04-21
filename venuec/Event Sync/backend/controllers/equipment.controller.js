const equipmentService = require('../services/equipment.service');

async function list(_req, res) {
  const data = await equipmentService.listEquipment();
  res.json({ data });
}

async function create(req, res) {
  const data = await equipmentService.createEquipment(req.body);
  res.json({ data });
}

async function update(req, res) {
  const data = await equipmentService.updateEquipment(req.params.equipmentId, req.body);
  res.json({ data });
}

async function remove(req, res) {
  const data = await equipmentService.removeEquipment(req.params.equipmentId);
  res.json({ data });
}

module.exports = { list, create, update, remove };
