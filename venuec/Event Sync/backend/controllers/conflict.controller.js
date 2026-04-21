const conflictService = require('../services/conflict.service');

async function list(_req, res) {
  const data = await conflictService.listConflicts();
  res.json({ data });
}

async function update(req, res) {
  const data = await conflictService.updateConflict(req.params.id, req.body);
  res.json({ data });
}

module.exports = { list, update };
