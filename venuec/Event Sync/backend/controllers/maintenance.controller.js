const maintenanceService = require('../services/maintenance.service');

async function list(_req, res) {
  const data = await maintenanceService.listMaintenance();
  res.json({ data });
}

async function create(req, res) {
  const data = await maintenanceService.createMaintenance(req.body);
  res.json({ data });
}

async function update(req, res) {
  const data = await maintenanceService.updateMaintenance(req.params.id, req.body);
  res.json({ data });
}

module.exports = { list, create, update };
