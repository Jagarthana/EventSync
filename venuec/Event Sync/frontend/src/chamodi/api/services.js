/**
 * Use in-browser store: set REACT_APP_USE_LOCAL_STORE=true (see .env.development).
 * Default: call the Node API (CRA proxy → http://127.0.0.1:5000 when backend runs).
 */
import * as local from './localStore';
import * as http from './httpApi';

const api = process.env.REACT_APP_USE_LOCAL_STORE === 'true' ? local : http;

export const authService = {
  login: (email, password) => api.apiLogin(email, password),
  me: () => api.apiMe(),
};

export const profileService = {
  get: () => api.apiGetProfile(),
  update: (body) => api.apiPutProfile(body),
};

export const venueService = {
  list: () => api.apiListVenues(),
  create: (body) => api.apiCreateVenue(body),
  update: (venueId, body) => api.apiUpdateVenue(venueId, body),
  remove: (venueId) => api.apiRemoveVenue(venueId),
};

export const equipmentService = {
  list: () => api.apiListEquipment(),
  create: (body) => api.apiCreateEquipment(body),
  update: (equipmentId, body) => api.apiUpdateEquipment(equipmentId, body),
  remove: (equipmentId) => api.apiRemoveEquipment(equipmentId),
};

export const allocationService = {
  list: () => api.apiListAllocations(),
  updateStatus: (bookingId, status) => api.apiPatchAllocationStatus(bookingId, status),
  update: (bookingId, body) => api.apiPutAllocation(bookingId, body),
};

export const studentBookingService = {
  list: () => api.apiListStudentBookings(),
};

export const conflictService = {
  list: () => api.apiListConflicts(),
  update: (id, body) => api.apiUpdateConflict(id, body),
};

export const maintenanceService = {
  list: () => api.apiListMaintenance(),
  create: (body) => api.apiCreateMaintenance(body),
  update: (id, body) => api.apiUpdateMaintenance(id, body),
};

export const activityService = {
  list: () => api.apiListActivity(),
  create: (body) => api.apiCreateActivity(body),
};

export const preEventService = {
  getAll: () => api.apiGetPreEventChecklists(),
  put: (bookingId, checks) => api.apiPutPreEventChecklist(bookingId, checks),
};

export const dashboardService = {
  summary: () => api.apiDashboardSummary(),
};

export const calendarService = {
  overlaps: () => api.apiGetCalendarOverlaps(),
};
