const { Venue } = require('../models');
const { rid } = require('../utils/id');
const { leanPlain } = require('../utils/transform');

async function listVenues() {
  const rows = await Venue.find().lean();
  return rows.map(leanPlain);
}

async function createVenue(body) {
  const b = body || {};
  const row = {
    venueId: rid('venue'),
    venueName: b.venueName,
    capacity: b.capacity ?? '',
    location: b.location ?? '',
    status: b.status || 'available',
    utilisation: b.utilisation ?? '0%',
  };
  await Venue.create(row);
  return row;
}

async function updateVenue(venueId, body) {
  const v = await Venue.findOne({ venueId });
  if (!v) {
    const e = new Error('Venue not found');
    e.status = 404;
    throw e;
  }
  Object.assign(v, body || {});
  await v.save();
  return leanPlain(v);
}

async function removeVenue(venueId) {
  const r = await Venue.deleteOne({ venueId });
  if (r.deletedCount === 0) {
    const e = new Error('Venue not found');
    e.status = 404;
    throw e;
  }
  return null;
}

module.exports = { listVenues, createVenue, updateVenue, removeVenue };
