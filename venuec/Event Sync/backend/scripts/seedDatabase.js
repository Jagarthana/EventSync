const { buildSeed } = require('../constants/seedData');
const {
  Profile,
  Venue,
  Equipment,
  Allocation,
  StudentBooking,
  Conflict,
  Maintenance,
  Activity,
  PreEventChecklist,
} = require('../models');

async function seedDatabase() {
  const s = buildSeed();

  await Profile.deleteMany({});
  await Profile.create(s.profile);

  await Venue.deleteMany({});
  if (s.venues.length) await Venue.insertMany(s.venues);

  await Equipment.deleteMany({});
  if (s.equipment.length) await Equipment.insertMany(s.equipment);

  await Allocation.deleteMany({});
  if (s.allocations.length) await Allocation.insertMany(s.allocations);

  await StudentBooking.deleteMany({});
  if (s.studentBookings.length) await StudentBooking.insertMany(s.studentBookings);

  await Conflict.deleteMany({});
  if (s.conflicts.length) {
    await Conflict.insertMany(
      s.conflicts.map((c) => ({
        conflictId: c.id,
        conflictType: c.conflictType,
        severity: c.severity,
        description: c.description,
        status: c.status,
        requestA: c.requestA,
        requestB: c.requestB,
      }))
    );
  }

  await Maintenance.deleteMany({});
  if (s.maintenance.length) {
    await Maintenance.insertMany(
      s.maintenance.map((m) => ({
        maintId: m.id,
        description: m.description,
        resource: m.resource,
        location: m.location,
        reported: m.reported,
        reportedBy: m.reportedBy,
        affectsEvent: m.affectsEvent,
        status: m.status,
        resolvedAt: m.resolvedAt,
      }))
    );
  }

  await Activity.deleteMany({});
  if (s.activity.length) await Activity.insertMany(s.activity);

  await PreEventChecklist.deleteMany({});
  const checklistEntries = Object.entries(s.checklists || {}).map(([bookingId, checks]) => ({
    bookingId,
    checks,
  }));
  if (checklistEntries.length) await PreEventChecklist.insertMany(checklistEntries);
}

/**
 * Full seed if DB is empty; if venues exist but profile is missing, insert profile only.
 */
async function ensureSeeded() {
  const venueCount = await Venue.countDocuments();
  if (venueCount === 0) {
    await seedDatabase();
    console.log('Database seeded with demo data');
    return;
  }
  const profileCount = await Profile.countDocuments();
  if (profileCount === 0) {
    const { buildSeed } = require('../constants/seedData');
    await Profile.create(buildSeed().profile);
    console.log('Default officer profile created');
  }
}

module.exports = { seedDatabase, ensureSeeded };
