const allocationService = require('../services/allocation.service');

async function list(_req, res) {
  const data = await allocationService.listAllocations();
  res.json({ data });
}

async function patchStatus(req, res) {
  const data = await allocationService.patchAllocationStatus(req.params.bookingId, req.body?.status);
  res.json({ data });
}

async function put(req, res) {
  const data = await allocationService.putAllocation(req.params.bookingId, req.body);
  res.json({ data });
}

module.exports = { list, patchStatus, put };
