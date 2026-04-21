/**
 * In-browser persistence (no backend). Same shapes the Express API used.
 */
import { overlaps, findOverlapPairs } from '../utils/allocationOverlap';

const STORAGE_KEY = 'eventsync_allocation_data';
const DEMO_EMAIL = 'officer@event.lk';
const DEMO_PASSWORD = 'officer123';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function futureIso(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function addDaysIso(isoStr, days) {
  const dt = new Date(`${isoStr}T12:00:00`);
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().slice(0, 10);
}

const BLOCKING = ['pending_venue', 'approved'];

function assertNoDoubleBooking(allocations, merged, excludeBookingId) {
  if (!merged?.venueId || !BLOCKING.includes(merged.status)) return;
  for (const o of allocations) {
    if (o.bookingId === excludeBookingId) continue;
    if (!BLOCKING.includes(o.status)) continue;
    if (overlaps(merged, o)) {
      const err = new Error(
        `Double booking: "${merged.eventName || merged.bookingId}" overlaps "${o.eventName || o.bookingId}" for this venue.`
      );
      err.status = 409;
      throw err;
    }
  }
}

function initialSeed() {
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
      { message: 'Demo data loaded — runs fully in the browser (no server).', time: ts },
      { message: 'Review pending requests in Incoming Requests.', time: ts },
    ],
    checklists: {
      'BK-OK-001': [true, false, false, false, false, false, false, false],
    },
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {
    /* fall through */
  }
  const seed = initialSeed();
  saveState(seed);
  return seed;
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetToDemo() {
  const seed = initialSeed();
  saveState(seed);
  return seed;
}

export { DEMO_EMAIL, DEMO_PASSWORD };

function rid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeLoginEmail(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\u200b/g, ''); // zero-width space (copy/paste)
}

function normalizeLoginPassword(value) {
  return String(value || '').trim().replace(/\u200b/g, '');
}

export function apiLogin(email, password) {
  const e = normalizeLoginEmail(email);
  const p = normalizeLoginPassword(password);
  if (e !== DEMO_EMAIL.toLowerCase() || p !== DEMO_PASSWORD) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    return Promise.reject(err);
  }
  const state = loadState();
  state.profile = { ...state.profile, email: DEMO_EMAIL };
  saveState(state);
  return Promise.resolve({
    data: {
      token: 'local-demo-token',
      user: { email: DEMO_EMAIL, role: 'allocation' },
    },
  });
}

export function apiMe() {
  return Promise.resolve({
    data: { email: loadState().profile?.email || DEMO_EMAIL, role: 'allocation' },
  });
}

export function apiGetProfile() {
  return Promise.resolve({ data: { ...loadState().profile } });
}

export function apiPutProfile(body) {
  const state = loadState();
  state.profile = { ...state.profile, ...body };
  saveState(state);
  return Promise.resolve({ data: { ...state.profile } });
}

export function apiListVenues() {
  return Promise.resolve({ data: [...loadState().venues] });
}

export function apiCreateVenue(body) {
  const state = loadState();
  const venueId = rid('venue');
  const row = {
    venueId,
    venueName: body.venueName,
    capacity: body.capacity ?? '',
    location: body.location ?? '',
    status: body.status || 'available',
    utilisation: body.utilisation ?? '0%',
  };
  state.venues.push(row);
  saveState(state);
  return Promise.resolve({ data: row });
}

export function apiUpdateVenue(venueId, body) {
  const state = loadState();
  const i = state.venues.findIndex((v) => v.venueId === venueId);
  if (i === -1) {
    const err = new Error('Venue not found');
    err.status = 404;
    return Promise.reject(err);
  }
  state.venues[i] = { ...state.venues[i], ...body };
  saveState(state);
  return Promise.resolve({ data: state.venues[i] });
}

export function apiRemoveVenue(venueId) {
  const state = loadState();
  const n = state.venues.filter((v) => v.venueId !== venueId);
  if (n.length === state.venues.length) {
    const err = new Error('Venue not found');
    err.status = 404;
    return Promise.reject(err);
  }
  state.venues = n;
  saveState(state);
  return Promise.resolve({ data: null });
}

export function apiListEquipment() {
  return Promise.resolve({ data: [...loadState().equipment] });
}

export function apiCreateEquipment(body) {
  const state = loadState();
  const name = body.equipmentName || body.resourceName;
  const equipmentId = rid('eq');
  const total = body.total != null && body.total !== '' ? Number(body.total) : 1;
  const available = body.available != null && body.available !== '' ? Number(body.available) : total;
  const row = {
    equipmentId,
    equipmentName: name,
    category: body.category || '',
    total,
    available,
    inUse: Number(body.inUse) || 0,
    underMaintenance: Number(body.underMaintenance) || 0,
    quantity: available,
    status: body.status || 'available',
    cost: Number(body.cost) || 0,
  };
  state.equipment.push(row);
  saveState(state);
  return Promise.resolve({ data: row });
}

export function apiUpdateEquipment(equipmentId, body) {
  const state = loadState();
  const i = state.equipment.findIndex((e) => e.equipmentId === equipmentId);
  if (i === -1) {
    const err = new Error('Equipment not found');
    err.status = 404;
    return Promise.reject(err);
  }
  state.equipment[i] = { ...state.equipment[i], ...body };
  saveState(state);
  return Promise.resolve({ data: state.equipment[i] });
}

export function apiRemoveEquipment(equipmentId) {
  const state = loadState();
  const n = state.equipment.filter((e) => e.equipmentId !== equipmentId);
  if (n.length === state.equipment.length) {
    const err = new Error('Equipment not found');
    err.status = 404;
    return Promise.reject(err);
  }
  state.equipment = n;
  saveState(state);
  return Promise.resolve({ data: null });
}

const STATUSES = ['pending_venue', 'approved', 'rejected', 'released'];

export function apiListAllocations() {
  return Promise.resolve({ data: [...loadState().allocations] });
}

export function apiPatchAllocationStatus(bookingId, status) {
  if (!STATUSES.includes(status)) {
    const err = new Error('Invalid status');
    err.status = 400;
    return Promise.reject(err);
  }
  const state = loadState();
  const i = state.allocations.findIndex((a) => a.bookingId === bookingId);
  if (i === -1) {
    const err = new Error('Booking not found');
    err.status = 404;
    return Promise.reject(err);
  }
  const merged = { ...state.allocations[i], status };
  try {
    assertNoDoubleBooking(state.allocations, merged, bookingId);
  } catch (e) {
    return Promise.reject(e);
  }
  state.allocations[i] = merged;
  saveState(state);
  return Promise.resolve({ data: state.allocations[i] });
}

export function apiPutAllocation(bookingId, body) {
  const state = loadState();
  const i = state.allocations.findIndex((a) => a.bookingId === bookingId);
  if (i === -1) {
    const err = new Error('Booking not found');
    err.status = 404;
    return Promise.reject(err);
  }
  const allowed = [
    'venueId',
    'venueName',
    'eventName',
    'date',
    'endDate',
    'startTime',
    'endTime',
    'status',
    'priority',
    'participants',
    'studentEmail',
    'eventType',
    'resources',
    'internalNotes',
    'requestedAt',
  ];
  const updates = {};
  for (const k of allowed) {
    if (k in body) updates[k] = body[k];
  }
  const merged = { ...state.allocations[i], ...updates };
  try {
    assertNoDoubleBooking(state.allocations, merged, bookingId);
  } catch (e) {
    return Promise.reject(e);
  }
  state.allocations[i] = merged;
  saveState(state);
  return Promise.resolve({ data: state.allocations[i] });
}

export function apiGetCalendarOverlaps() {
  const pairs = findOverlapPairs(loadState().allocations);
  return Promise.resolve({ data: { pairs, count: pairs.length } });
}

export function apiListStudentBookings() {
  return Promise.resolve({ data: [...loadState().studentBookings] });
}

export function apiListConflicts() {
  return Promise.resolve({ data: [...loadState().conflicts] });
}

export function apiUpdateConflict(id, body) {
  const state = loadState();
  const i = state.conflicts.findIndex((c) => c.id === id);
  if (i === -1) {
    const err = new Error('Conflict not found');
    err.status = 404;
    return Promise.reject(err);
  }
  state.conflicts[i] = { ...state.conflicts[i], ...body };
  saveState(state);
  return Promise.resolve({ data: state.conflicts[i] });
}

export function apiListMaintenance() {
  return Promise.resolve({ data: [...loadState().maintenance] });
}

export function apiCreateMaintenance(body) {
  const state = loadState();
  const id = rid('maint');
  const reported = new Date().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  const row = {
    id,
    description: body.description,
    resource: body.resource || '',
    location: body.location || '',
    affectsEvent: body.affectsEvent || '',
    reported,
    reportedBy: 'Allocation Officer',
    status: 'open',
  };
  state.maintenance.push(row);
  saveState(state);
  return Promise.resolve({ data: row });
}

export function apiUpdateMaintenance(id, body) {
  const state = loadState();
  const i = state.maintenance.findIndex((m) => m.id === id);
  if (i === -1) {
    const err = new Error('Issue not found');
    err.status = 404;
    return Promise.reject(err);
  }
  const next = { ...state.maintenance[i], ...body };
  if (body.status === 'resolved' && !next.resolvedAt) {
    next.resolvedAt = new Date().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  }
  state.maintenance[i] = next;
  saveState(state);
  return Promise.resolve({ data: state.maintenance[i] });
}

export function apiListActivity() {
  return Promise.resolve({ data: [...loadState().activity] });
}

export function apiCreateActivity(body) {
  const state = loadState();
  const row = {
    message: body.message,
    time: new Date().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }),
  };
  state.activity.unshift(row);
  saveState(state);
  return Promise.resolve({ data: row });
}

export function apiGetPreEventChecklists() {
  return Promise.resolve({ data: { ...loadState().checklists } });
}

export function apiPutPreEventChecklist(bookingId, checks) {
  const state = loadState();
  state.checklists = { ...state.checklists, [bookingId]: checks };
  saveState(state);
  return Promise.resolve({ data: { bookingId, checks } });
}

export function apiDashboardSummary() {
  const state = loadState();
  const today = todayIso();
  const pending = state.allocations.filter((a) => a.status === 'pending_venue').length;
  const openConflicts = state.conflicts.filter((c) => c.status !== 'resolved').length;
  const issues = state.maintenance.filter((m) => m.status === 'open').length;

  const upcomingApproved = state.allocations.filter((a) => a.status === 'approved' && a.date >= today);
  let preEvent = 0;
  for (const a of upcomingApproved) {
    const checks = state.checklists[a.bookingId] || [];
    const incomplete = checks.length === 0 || checks.some((x) => !x);
    if (incomplete) preEvent += 1;
  }

  return Promise.resolve({
    data: { pending, conflicts: openConflicts, preEvent, issues },
  });
}
