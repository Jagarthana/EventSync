/** Month grid + bar positions for venue booking calendar */

export function getMonthMatrix(year, monthIndex) {
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  const startPad = first.getDay();
  const daysInMonth = last.getDate();
  const cells = [];

  for (let i = 0; i < startPad; i += 1) {
    cells.push({ inMonth: false, date: null, iso: null, n: null });
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    const date = new Date(year, monthIndex, d);
    cells.push({
      inMonth: true,
      date,
      iso: date.toISOString().slice(0, 10),
      n: d,
    });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ inMonth: false, date: null, iso: null, n: null });
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return { weeks, daysInMonth };
}

export function parseISODate(iso) {
  if (!iso) return null;
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Inclusive calendar-day span for a booking */
export function bookingDaySpan(booking) {
  const start = parseISODate(booking.date);
  const endIso = booking.endDate || booking.date;
  const end = parseISODate(endIso);
  if (!start || !end) return null;
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return { startMs: s, endMs: e };
}

export function dayTouchesBooking(isoDay, booking) {
  const span = bookingDaySpan(booking);
  if (!span) return false;
  const d = parseISODate(isoDay);
  if (!d) return false;
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return t >= span.startMs && t <= span.endMs;
}

export function dayRole(booking, isoDay) {
  const span = bookingDaySpan(booking);
  if (!span) return null;
  const d = parseISODate(isoDay);
  if (!d) return null;
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  if (t < span.startMs || t > span.endMs) return null;
  if (t === span.startMs && t === span.endMs) return 'single';
  if (t === span.startMs) return 'checkin';
  if (t === span.endMs) return 'checkout';
  return 'booked';
}

/**
 * Horizontal bar within month track (0–100%).
 */
export function barStyleInMonth(booking, year, monthIndex) {
  const span = bookingDaySpan(booking);
  if (!span) return null;
  const monthStart = new Date(year, monthIndex, 1).getTime();
  const monthEnd = new Date(year, monthIndex + 1, 0);
  const monthEndMs = new Date(monthEnd.getFullYear(), monthEnd.getMonth(), monthEnd.getDate()).getTime();
  const len = monthEnd.getDate();

  const start = Math.max(span.startMs, monthStart);
  const end = Math.min(span.endMs, monthEndMs);
  if (start > end) return null;

  const startDate = new Date(start);
  const dayNum = startDate.getDate();
  const endDate = new Date(end);
  const endDayNum = endDate.getDate();

  const startIdx = dayNum - 1;
  const endIdx = endDayNum - 1;
  const widthDays = endIdx - startIdx + 1;

  const leftPct = (startIdx / len) * 100;
  const widthPct = (widthDays / len) * 100;

  return { leftPct, widthPct, startIdx, widthDays };
}
