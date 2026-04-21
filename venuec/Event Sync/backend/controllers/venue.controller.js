const venueService = require('../services/venue.service');

async function list(_req, res) {
  const data = await venueService.listVenues();
  res.json({ data });
}

async function create(req, res) {
  const data = await venueService.createVenue(req.body);
  res.json({ data });
}

async function update(req, res) {
  const data = await venueService.updateVenue(req.params.venueId, req.body);
  res.json({ data });
}

async function remove(req, res) {
  const data = await venueService.removeVenue(req.params.venueId);
  res.json({ data });
}

module.exports = { list, create, update, remove };
