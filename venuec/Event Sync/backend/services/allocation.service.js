const { Allocation } = require('../models');
const { STATUSES, UPDATE_FIELDS } = require('../constants/allocation');
const { leanPlain } = require('../utils/transform');
const { overlaps, isBlockingStatus } = require('../utils/allocationOverlap');

async function listAllocations() {
  const rows = await Allocation.find().lean();
  return rows.map(leanPlain);
}

async function assertNoDoubleBooking(merged, excludeBookingId) {
  if (!merged || !merged.venueId) return;
  if (!isBlockingStatus(merged.status)) return;
  const others = await Allocation.find({
    venueId: merged.venueId,
    bookingId: { $ne: excludeBookingId },
    status: { $in: ['pending_venue', 'approved'] },
  }).lean();
  for (const o of others) {
    if (overlaps(merged, o)) {
      const err = new Error(
        `Double booking: "${merged.eventName || merged.bookingId}" overlaps "${o.eventName || o.bookingId}" for this venue.`
      );
      err.status = 409;
      throw err;
    }
  }
}

async function patchAllocationStatus(bookingId, status) {
  if (!STATUSES.includes(status)) {
    const e = new Error('Invalid status');
    e.status = 400;
    throw e;
  }
  const a = await Allocation.findOne({ bookingId });
  if (!a) {
    const e = new Error('Booking not found');
    e.status = 404;
    throw e;
  }
  a.status = status;
  const merged = leanPlain(a);
  await assertNoDoubleBooking(merged, bookingId);
  await a.save();
  return leanPlain(a);
}

async function putAllocation(bookingId, body) {
  const a = await Allocation.findOne({ bookingId });
  if (!a) {
    const e = new Error('Booking not found');
    e.status = 404;
    throw e;
  }
  const b = body || {};
  for (const k of UPDATE_FIELDS) {
    if (k in b) a[k] = b[k];
  }
  const merged = leanPlain(a);
  await assertNoDoubleBooking(merged, bookingId);
  await a.save();
  return leanPlain(a);
}

module.exports = { listAllocations, patchAllocationStatus, putAllocation };
