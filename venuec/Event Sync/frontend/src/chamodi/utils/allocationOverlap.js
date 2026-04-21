/** Client-side overlap detection (mirrors backend/utils/allocationOverlap.js) */

function padTime(t) {
  if (t == null || t === '') return '08:00';
  const p = String(t).trim();
  return p.length >= 5 ? p.slice(0, 5) : p;
}

export function allocationWindowMs(a) {
  if (!a || !a.date) return null;
  const startDate = a.date;
  const endDate = a.endDate || a.date;
  const st = padTime(a.startTime);
  const et = padTime(a.endTime);
  const start = new Date(`${startDate}T${st}:00`);
  let end = new Date(`${endDate}T${et}:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  if (end <= start) {
    end = new Date(start.getTime() + 60 * 60 * 1000);
  }
  return { start: start.getTime(), end: end.getTime() };
}

export function overlaps(a, b) {
  if (!a || !b || a.venueId !== b.venueId) return false;
  const w1 = allocationWindowMs(a);
  const w2 = allocationWindowMs(b);
  if (!w1 || !w2) return false;
  return w1.start < w2.end && w2.start < w1.end;
}

const BLOCKING = ['pending_venue', 'approved'];

export function findOverlapPairs(allocations) {
  const blocking = allocations.filter((x) => BLOCKING.includes(x.status));
  const pairs = [];
  for (let i = 0; i < blocking.length; i += 1) {
    for (let j = i + 1; j < blocking.length; j += 1) {
      const A = blocking[i];
      const B = blocking[j];
      if (A.venueId !== B.venueId) continue;
      if (overlaps(A, B)) {
        pairs.push({
          venueId: A.venueId,
          venueName: A.venueName || B.venueName,
          bookingA: {
            bookingId: A.bookingId,
            eventName: A.eventName,
            date: A.date,
            endDate: A.endDate || A.date,
          },
          bookingB: {
            bookingId: B.bookingId,
            eventName: B.eventName,
            date: B.date,
            endDate: B.endDate || B.date,
          },
        });
      }
    }
  }
  return pairs;
}
