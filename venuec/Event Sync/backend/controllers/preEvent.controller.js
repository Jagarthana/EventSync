const preEventService = require('../services/preEvent.service');

async function getAll(_req, res) {
  const data = await preEventService.getAllChecklists();
  res.json({ data });
}

async function put(req, res) {
  const data = await preEventService.putChecklist(req.params.bookingId, req.body);
  res.json({ data });
}

module.exports = { getAll, put };
