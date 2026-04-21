/**
 * HTTP transport — same function names and return shapes as localStore.js
 */
import { getToken } from './client';

const API_BASE = (process.env.REACT_APP_API_BASE || '').replace(/\/$/, '');

function url(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

async function request(method, pathStr, { body, skipAuth } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (!skipAuth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  const res = await fetch(url(pathStr), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    const err = new Error(text || res.statusText);
    err.status = res.status;
    throw err;
  }

  if (!res.ok) {
    const err = new Error(json.error || json.message || res.statusText);
    err.status = res.status;
    throw err;
  }

  return json;
}

export async function apiLogin(email, password) {
  return request('POST', '/api/auth/login', { body: { email, password }, skipAuth: true });
}

export async function apiMe() {
  return request('GET', '/api/auth/me');
}

export async function apiGetProfile() {
  return request('GET', '/api/profile');
}

export async function apiPutProfile(body) {
  return request('PUT', '/api/profile', { body });
}

export async function apiListVenues() {
  return request('GET', '/api/venues');
}

export async function apiCreateVenue(body) {
  return request('POST', '/api/venues', { body });
}

export async function apiUpdateVenue(venueId, body) {
  return request('PUT', `/api/venues/${encodeURIComponent(venueId)}`, { body });
}

export async function apiRemoveVenue(venueId) {
  return request('DELETE', `/api/venues/${encodeURIComponent(venueId)}`);
}

export async function apiListEquipment() {
  return request('GET', '/api/equipment');
}

export async function apiCreateEquipment(body) {
  return request('POST', '/api/equipment', { body });
}

export async function apiUpdateEquipment(equipmentId, body) {
  return request('PUT', `/api/equipment/${encodeURIComponent(equipmentId)}`, { body });
}

export async function apiRemoveEquipment(equipmentId) {
  return request('DELETE', `/api/equipment/${encodeURIComponent(equipmentId)}`);
}

export async function apiListAllocations() {
  return request('GET', '/api/allocations');
}

export async function apiPatchAllocationStatus(bookingId, status) {
  return request('PATCH', `/api/allocations/${encodeURIComponent(bookingId)}/status`, { body: { status } });
}

export async function apiPutAllocation(bookingId, body) {
  return request('PUT', `/api/allocations/${encodeURIComponent(bookingId)}`, { body });
}

export async function apiListStudentBookings() {
  return request('GET', '/api/student-bookings');
}

export async function apiListConflicts() {
  return request('GET', '/api/conflicts');
}

export async function apiUpdateConflict(id, body) {
  return request('PATCH', `/api/conflicts/${encodeURIComponent(id)}`, { body });
}

export async function apiListMaintenance() {
  return request('GET', '/api/maintenance');
}

export async function apiCreateMaintenance(body) {
  return request('POST', '/api/maintenance', { body });
}

export async function apiUpdateMaintenance(id, body) {
  return request('PATCH', `/api/maintenance/${encodeURIComponent(id)}`, { body });
}

export async function apiListActivity() {
  return request('GET', '/api/activity');
}

export async function apiCreateActivity(body) {
  return request('POST', '/api/activity', { body });
}

export async function apiGetPreEventChecklists() {
  return request('GET', '/api/pre-event-checklists');
}

export async function apiPutPreEventChecklist(bookingId, checks) {
  return request('PUT', `/api/pre-event-checklists/${encodeURIComponent(bookingId)}`, { body: checks });
}

export async function apiDashboardSummary() {
  return request('GET', '/api/dashboard/summary');
}

export async function apiGetCalendarOverlaps() {
  return request('GET', '/api/calendar/overlaps');
}
