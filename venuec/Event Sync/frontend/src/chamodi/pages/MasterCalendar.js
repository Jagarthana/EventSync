import React, { useState, useEffect, useMemo } from 'react';
import AllocationPageShell from '../components/AllocationPageShell';
import { venueService, allocationService, calendarService } from '../api/services';
import {
  getMonthMatrix,
  dayTouchesBooking,
  dayRole,
  barStyleInMonth,
  bookingDaySpan,
} from '../utils/calendarMonth';
import '../styles/MasterCalendar.css';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const BLOCKING = ['approved', 'pending_venue'];

function monthName(m) {
  return new Date(2000, m, 1).toLocaleString(undefined, { month: 'long' });
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function bookingTouchesMonth(booking, year, monthIndex) {
  const span = bookingDaySpan(booking);
  if (!span) return false;
  const ms = new Date(year, monthIndex, 1).getTime();
  const me = new Date(year, monthIndex + 1, 0);
  const monthEnd = new Date(me.getFullYear(), me.getMonth(), me.getDate()).getTime();
  return span.startMs <= monthEnd && span.endMs >= ms;
}

function nightsInSpan(booking) {
  const span = bookingDaySpan(booking);
  if (!span) return 0;
  return Math.round((span.endMs - span.startMs) / (24 * 60 * 60 * 1000)) + 1;
}

export default function MasterCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [monthIndex, setMonthIndex] = useState(now.getMonth());
  const [venues, setVenues] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [overlapData, setOverlapData] = useState({ pairs: [], count: 0 });
  const [venueId, setVenueId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const todayStr = todayIso();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError('');
      try {
        const [{ data: v }, { data: all }, { data: ov }] = await Promise.all([
          venueService.list(),
          allocationService.list(),
          calendarService.overlaps(),
        ]);
        if (cancelled) return;
        setVenues(v || []);
        setAllocations(all || []);
        setOverlapData(ov || { pairs: [], count: 0 });
        setVenueId((prev) => prev || (v?.[0]?.venueId ?? ''));
      } catch (e) {
        if (!cancelled) {
          setError(e.message || 'Failed to load calendar');
          setVenues([]);
          setAllocations([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handler = () => {
      (async () => {
        try {
          const [{ data: v }, { data: all }, { data: ov }] = await Promise.all([
            venueService.list(),
            allocationService.list(),
            calendarService.overlaps(),
          ]);
          setVenues(v || []);
          setAllocations(all || []);
          setOverlapData(ov || { pairs: [], count: 0 });
        } catch (e) {
          setError(e.message || 'Failed to refresh');
        }
      })();
    };
    window.addEventListener('allocation-data-updated', handler);
    return () => window.removeEventListener('allocation-data-updated', handler);
  }, []);

  const selectedVenue = useMemo(
    () => venues.find((x) => x.venueId === venueId) || null,
    [venues, venueId]
  );

  const blockingForVenue = useMemo(() => {
    return allocations.filter((a) => a.venueId === venueId && BLOCKING.includes(a.status));
  }, [allocations, venueId]);

  const monthBookings = useMemo(() => {
    return blockingForVenue.filter((b) => bookingTouchesMonth(b, year, monthIndex));
  }, [blockingForVenue, year, monthIndex]);

  const stats = useMemo(() => {
    return {
      count: monthBookings.length,
      guests: monthBookings.reduce((s, b) => s + (Number(b.participants) || 0), 0),
      eventDays: monthBookings.reduce((s, b) => s + nightsInSpan(b), 0),
    };
  }, [monthBookings]);

  const venueOverlapCount = useMemo(() => {
    return overlapData.pairs.filter((p) => p.venueId === venueId).length;
  }, [overlapData.pairs, venueId]);

  const { weeks, daysInMonth } = useMemo(() => getMonthMatrix(year, monthIndex), [year, monthIndex]);

  const goMonth = (delta) => {
    const d = new Date(year, monthIndex + delta, 1);
    setYear(d.getFullYear());
    setMonthIndex(d.getMonth());
  };

  const formatTime = (t) => (t && String(t).length >= 5 ? String(t).slice(0, 5) : t || '—');

  const isViewingCurrentMonth = year === now.getFullYear() && monthIndex === now.getMonth();

  return (
    <AllocationPageShell
      eyebrow="CALENDAR"
      title="Master calendar"
      subtitle="Plan venue use, spot conflicts, and scan the month at a glance."
    >
      {error && (
        <div className="es-alert es-alert--danger mc-alert" role="alert">
          {error}
        </div>
      )}
      {loading ? (
        <div className="mc-skeleton es-card" aria-busy="true" aria-label="Loading calendar">
          <div className="mc-skeleton__side" />
          <div className="mc-skeleton__main">
            <div className="mc-skeleton__bar" />
            <div className="mc-skeleton__grid" />
          </div>
        </div>
      ) : (
        <div className="mc-root">
          <aside className="mc-sidebar mc-surface">
            <div className="mc-sidebar__brand">
              <span className="mc-sidebar__kicker">Selected space</span>
              <div className="mc-sidebar__select-wrap">
                <select
                  className="mc-select"
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  aria-label="Select venue"
                >
                  {venues.map((v) => (
                    <option key={v.venueId} value={v.venueId}>
                      {v.venueName}
                    </option>
                  ))}
                </select>
              </div>
              {selectedVenue?.location && (
                <p className="mc-sidebar__location">{selectedVenue.location}</p>
              )}
            </div>

            <div className="mc-sidebar__month-chip">
              <span className="mc-sidebar__month-name">
                {monthName(monthIndex)}
              </span>
              <span className="mc-sidebar__year">{year}</span>
            </div>

            <div className="mc-stat-grid">
              <div className="mc-stat-tile">
                <span className="mc-stat-tile__label">Bookings</span>
                <span className="mc-stat-tile__value">{stats.count}</span>
                <span className="mc-stat-tile__hint">in this month</span>
              </div>
              <div className="mc-stat-tile">
                <span className="mc-stat-tile__label">Participants</span>
                <span className="mc-stat-tile__value">{stats.guests}</span>
                <span className="mc-stat-tile__hint">total headcount</span>
              </div>
              <div className="mc-stat-tile">
                <span className="mc-stat-tile__label">Event days</span>
                <span className="mc-stat-tile__value">{stats.eventDays}</span>
                <span className="mc-stat-tile__hint">incl. multi-day</span>
              </div>
              <div
                className={`mc-stat-tile mc-stat-tile--alert ${venueOverlapCount ? 'mc-stat-tile--bad' : 'mc-stat-tile--ok'}`}
              >
                <span className="mc-stat-tile__label">Conflicts</span>
                <span className="mc-stat-tile__value">{venueOverlapCount}</span>
                <span className="mc-stat-tile__hint">overlap pairs · venue</span>
              </div>
            </div>

            <div className="mc-sidebar__callout">
              <strong>How to read this</strong>
              <p>
                Blue = confirmed. Amber = awaiting approval. Same venue cannot overlap in time for those
                states — conflicts appear below.
              </p>
            </div>
          </aside>

          <div className="mc-main">
            <header className="mc-hero mc-surface">
              <div className="mc-hero__nav">
                <button type="button" className="mc-hero__arrow" onClick={() => goMonth(-1)} aria-label="Previous month">
                  <span aria-hidden="true">‹</span>
                </button>
                <div className="mc-hero__title-block">
                  <p className="mc-hero__eyebrow">Month view</p>
                  <h2 className="mc-hero__title">
                    {monthName(monthIndex)} <span className="mc-hero__year">{year}</span>
                  </h2>
                </div>
                <button type="button" className="mc-hero__arrow" onClick={() => goMonth(1)} aria-label="Next month">
                  <span aria-hidden="true">›</span>
                </button>
              </div>
              <div className="mc-hero__actions">
                <button
                  type="button"
                  className={`mc-btn-today ${isViewingCurrentMonth ? 'mc-btn-today--active' : ''}`}
                  onClick={() => {
                    const t = new Date();
                    setYear(t.getFullYear());
                    setMonthIndex(t.getMonth());
                  }}
                >
                  Today
                </button>
              </div>
            </header>

            <div className="mc-legend mc-surface mc-legend--inline">
              <span className="mc-legend__title">Legend</span>
              <span className="mc-legend__item">
                <span className="mc-legend__swatch mc-legend__swatch--ok" /> Confirmed
              </span>
              <span className="mc-legend__item">
                <span className="mc-legend__swatch mc-legend__swatch--pending" /> Pending approval
              </span>
              <span className="mc-legend__item">
                <span className="mc-legend__swatch mc-legend__swatch--weekend" /> Weekend
              </span>
            </div>

            {venues.length === 0 ? (
              <div className="mc-empty mc-surface">
                <p className="mc-empty__title">No venues yet</p>
                <p className="mc-empty__text">Add venues under Venue management to populate this calendar.</p>
              </div>
            ) : (
              <>
                <section className="mc-month-wrap">
                  <div className="mc-month-head">
                    <h3 className="mc-section-title">Schedule grid</h3>
                    <p className="mc-section-sub">Each cell is one day · scroll on small screens</p>
                  </div>
                  <div className="mc-month mc-surface">
                    <div className="mc-dow-row">
                      {WEEKDAYS.map((d, di) => (
                        <div
                          key={d}
                          className={`mc-dow-cell ${di === 0 || di === 6 ? 'mc-dow-cell--weekend' : ''}`}
                        >
                          {d}
                        </div>
                      ))}
                    </div>
                    {weeks.map((week, wi) => (
                      <div key={wi} className="mc-week">
                        <div className="mc-week-grid">
                          {week.map((cell, ci) => {
                            if (!cell.inMonth) {
                              return <div key={`pad-${wi}-${ci}`} className="mc-day mc-day--pad" />;
                            }
                            const isToday = cell.iso === todayStr;
                            const isWeekend = ci === 0 || ci === 6;
                            const dayBookings = blockingForVenue.filter((b) => dayTouchesBooking(cell.iso, b));
                            return (
                              <div
                                key={cell.iso}
                                className={`mc-day ${isToday ? 'mc-day--today' : ''} ${isWeekend ? 'mc-day--weekend' : ''}`}
                              >
                                <span className="mc-day__num">{cell.n}</span>
                                {isToday && <span className="mc-day__today-badge">Today</span>}
                                <div className="mc-day__stack">
                                  {dayBookings.slice(0, 4).map((b) => {
                                    const role = dayRole(b, cell.iso);
                                    const label =
                                      role === 'checkin'
                                        ? 'Check-in'
                                        : role === 'checkout'
                                          ? 'Check-out'
                                          : role === 'single'
                                            ? 'Event'
                                            : 'Booked';
                                    const pending = b.status === 'pending_venue';
                                    return (
                                      <div
                                        key={b.bookingId + cell.iso}
                                        className={`mc-pill ${pending ? 'mc-pill--pending' : 'mc-pill--ok'}`}
                                        title={`${b.eventName} · ${formatTime(b.startTime)}–${formatTime(b.endTime)}`}
                                      >
                                        <span className="mc-pill__role">{label}</span>
                                        <span className="mc-pill__name">{b.eventName}</span>
                                        <span className="mc-pill__meta">
                                          {b.participants != null ? `${b.participants} pax` : '—'} ·{' '}
                                          {formatTime(b.startTime)}–{formatTime(b.endTime)}
                                        </span>
                                      </div>
                                    );
                                  })}
                                  {dayBookings.length > 4 && (
                                    <div className="mc-pill mc-pill--more">+{dayBookings.length - 4} more</div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="mc-gantt-wrap">
                  <div className="mc-gantt-head">
                    <h3 className="mc-section-title">Month timeline</h3>
                    <p className="mc-section-sub">
                      {selectedVenue?.venueName || 'Venue'} · {daysInMonth} days · proportional width
                    </p>
                  </div>
                  <div className="mc-gantt mc-surface">
                    <div className="mc-gantt__ruler-wrap">
                      <div
                        className="mc-gantt__ruler"
                        style={{ gridTemplateColumns: `repeat(${daysInMonth}, minmax(0, 1fr))` }}
                        aria-hidden="true"
                      >
                        {Array.from({ length: daysInMonth }, (_, i) => (
                          <span key={i} className="mc-gantt__tick">
                            {i + 1}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mc-gantt__track">
                      {monthBookings.map((b) => {
                        const style = barStyleInMonth(b, year, monthIndex);
                        if (!style) return null;
                        const pending = b.status === 'pending_venue';
                        return (
                          <div key={b.bookingId} className="mc-gantt__row">
                            <div className="mc-gantt__label">
                              <strong>{b.eventName}</strong>
                              <span className="mc-gantt__sub">
                                {b.studentEmail || 'Organizer'} · {b.participants ?? '—'} guests · {nightsInSpan(b)} day
                                span
                              </span>
                            </div>
                            <div className="mc-gantt__bar-wrap">
                              <div
                                className={`mc-gantt__bar ${pending ? 'mc-gantt__bar--pending' : ''}`}
                                style={{ left: `${style.leftPct}%`, width: `${style.widthPct}%` }}
                              >
                                <span className="mc-gantt__bar-text">{b.eventName}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {monthBookings.length === 0 && (
                      <p className="mc-gantt__empty">No bookings this month for this venue.</p>
                    )}
                  </div>
                </section>

                <section className="mc-overlaps-wrap">
                  <div className="mc-overlaps-head">
                    <h3 className="mc-section-title">Double-booking check</h3>
                    <p className="mc-section-sub">System-wide · overlapping approved or pending slots</p>
                  </div>
                  <div className="mc-overlaps mc-surface">
                    {overlapData.count === 0 ? (
                      <div className="mc-overlaps__ok">
                        <span className="mc-overlaps__ok-icon" aria-hidden="true">✓</span>
                        <div>
                          <p className="mc-overlaps__ok-title">All clear</p>
                          <p className="mc-overlaps__ok-text">No overlapping blocking bookings right now.</p>
                        </div>
                      </div>
                    ) : (
                      <ul className="mc-overlap-list">
                        {overlapData.pairs.map((p, idx) => (
                          <li key={`${p.bookingA.bookingId}-${p.bookingB.bookingId}-${idx}`} className="mc-overlap-item">
                            <div className="mc-overlap-item__venue">{p.venueName}</div>
                            <div className="mc-overlap-item__detail">
                              <span className="mc-overlap-item__a">{p.bookingA.eventName}</span>
                              <span className="mc-overlap-item__vs">↔</span>
                              <span className="mc-overlap-item__b">{p.bookingB.eventName}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      )}
    </AllocationPageShell>
  );
}
