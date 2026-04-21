/**
 * Initial dataset — same shape as frontend/src/chamodi/api/localStore.js
 */
const { DEMO_EMAIL } = require('./auth');

function futureIso(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function addDaysIso(isoStr, days) {
  const d = new Date(`${isoStr}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function buildSeed() {
  const t = new Date();
  const ts = t.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  const f = futureIso(14);

  return {
    profile: {
      email: DEMO_EMAIL,
      displayName: 'K. Perera',
      department: 'Facilities Management Unit',
      roleTitle: 'Venue and Resources Allocation Officer',
      phone: '',
      avatarDataUrl: '',
    },
    venues: [
      {
        venueId: 'venue-hall-a',
        venueName: 'Main Hall A',
        capacity: 400,
        location: 'Block A, Ground floor',
        status: 'available',
        utilisation: '42%',
      },
      {
        venueId: 'venue-seminar-2',
        venueName: 'Seminar Room 2',
        capacity: 80,
        location: 'Library wing',
        status: 'available',
        utilisation: '18%',
      },
      {
        venueId: 'venue-auditorium',
        venueName: 'Auditorium',
        capacity: 600,
        location: 'Central campus',
        status: 'blocked',
        utilisation: '0%',
      },
    ],
    equipment: [
      {
        equipmentId: 'eq-pa-1',
        equipmentName: 'PA system (portable)',
        category: 'Audio',
        total: 4,
        available: 2,
        inUse: 2,
        underMaintenance: 0,
        status: 'in_use',
        cost: 0,
      },
      {
        equipmentId: 'eq-seating',
        equipmentName: 'Extra seating bundle',
        category: 'Furniture',
        total: 200,
        available: 120,
        inUse: 80,
        underMaintenance: 0,
        status: 'available',
        cost: 0,
      },
    ],
    allocations: [
      {
        bookingId: 'BK-PEND-001',
        venueId: 'venue-hall-a',
        venueName: 'Main Hall A',
        eventName: 'Faculty welcome mixer',
        date: f,
        startTime: '14:00',
        endTime: '18:00',
        status: 'pending_venue',
        priority: 'high',
        participants: 350,
        studentEmail: 'soc@uni.lk',
        eventType: 'Social',
        resources: [{ name: 'PA system', quantity: 1 }, { name: 'Extra seating', quantity: 50 }],
        internalNotes: 'VIP seating near stage.',
        requestedAt: t.toLocaleDateString(),
      },
      {
        bookingId: 'BK-PEND-002',
        venueId: 'venue-seminar-2',
        venueName: 'Seminar Room 2',
        eventName: 'CS workshop',
        date: f,
        startTime: '09:00',
        endTime: '13:00',
        status: 'pending_venue',
        priority: 'normal',
        participants: 60,
        studentEmail: 'csclub@uni.lk',
        eventType: 'Workshop',
        resources: [{ name: 'Projector', quantity: 2 }],
        requestedAt: t.toLocaleDateString(),
      },
      {
        bookingId: 'BK-OK-001',
        venueId: 'venue-seminar-2',
        venueName: 'Seminar Room 2',
        eventName: 'Research methods seminar',
        date: f,
        startTime: '10:00',
        endTime: '17:00',
        status: 'approved',
        priority: 'normal',
        participants: 40,
        studentEmail: 'grad@uni.lk',
        eventType: 'Seminar',
        resources: [],
        requestedAt: t.toLocaleDateString(),
      },
      {
        bookingId: 'BK-MULTI-001',
        venueId: 'venue-hall-a',
        venueName: 'Main Hall A',
        eventName: 'Orientation week (multi-day)',
        date: f,
        endDate: addDaysIso(f, 2),
        startTime: '09:00',
        endTime: '18:00',
        status: 'approved',
        priority: 'normal',
        participants: 200,
        studentEmail: 'welcome@uni.lk',
        eventType: 'Conference',
        resources: [],
        requestedAt: t.toLocaleDateString(),
      },
    ],
    studentBookings: [
      {
        bookingId: 'SB-001',
        status: 'confirm',
        eventDate: f,
        venueName: 'Seminar Room 2',
      },
    ],
    conflicts: [
      {
        id: 'CF-001',
        conflictType: 'Double booking',
        severity: 'high',
        description: 'Capacity overlap: two events requested overlapping AV load.',
        status: 'open',
        requestA: {
          eventName: 'Faculty welcome mixer',
          date: f,
          startTime: '14:00',
          endTime: '18:00',
          participants: 350,
          bookingId: 'BK-PEND-001',
          organiser: 'SOC',
        },
        requestB: {
          eventName: 'Open day rehearsal',
          date: f,
          startTime: '16:00',
          endTime: '19:00',
          participants: 200,
          bookingId: 'BK-EXT-99',
          organiser: 'Marketing',
        },
      },
    ],
    maintenance: [
      {
        id: 'maint-seed-1',
        description: 'Projector lamp flicker — Seminar Room 2',
        resource: 'Projector',
        location: 'Seminar Room 2',
        reported: ts,
        reportedBy: 'AV Team',
        affectsEvent: 'Research methods seminar',
        status: 'open',
      },
      {
        id: 'maint-seed-2',
        description: 'Loose stage railing — Main Hall A',
        resource: 'Stage',
        location: 'Main Hall A',
        reported: 'Jan 10, 2026, 9:00 AM',
        reportedBy: 'Security',
        affectsEvent: '—',
        status: 'resolved',
        resolvedAt: 'Jan 12, 2026, 4:30 PM',
      },
    ],
    activity: [
      { message: 'Server data store initialised.', time: ts },
      { message: 'Review pending requests in Incoming Requests.', time: ts },
    ],
    checklists: {
      'BK-OK-001': [true, false, false, false, false, false, false, false],
    },
  };
}

module.exports = { buildSeed };
