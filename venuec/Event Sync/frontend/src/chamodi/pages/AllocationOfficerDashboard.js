import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AllocationPageShell from '../components/AllocationPageShell';
import { useOfficerProfile } from '../context/OfficerProfileContext';
import { allocationService, conflictService, venueService, activityService, maintenanceService } from '../api/services';
import '../styles/AllocationOfficerDashboard.css';

const DOT_CLASS = ['ao-dash__dot--p', 'ao-dash__dot--g', 'ao-dash__dot--y', 'ao-dash__dot--b', 'ao-dash__dot--pk'];

function greetingLabel() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function AllocationOfficerDashboard() {
  const navigate = useNavigate();
  const { profile } = useOfficerProfile();
  const [stats, setStats] = useState({
    pending: 0,
    active: 0,
    conflicts: 0,
    maintenance: 0,
  });
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [venueRows, setVenueRows] = useState([]);
  const [highPriorityPending, setHighPriorityPending] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const subtitle = useMemo(() => {
    const d = new Date();
    return `${d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · ${profile.department}`;
  }, [profile.department]);

  const title = useMemo(() => {
    const name = profile.displayName?.split?.(' ')?.[0] || 'there';
    return `${greetingLabel()}, ${name} 👋`;
  }, [profile.displayName]);

  const loadData = async () => {
    setError('');
    try {
      const [{ data: allocations }, { data: conflicts }, { data: venues }, { data: activity }, { data: maintenanceList }] =
        await Promise.all([
          allocationService.list(),
          conflictService.list(),
          venueService.list(),
          activityService.list(),
          maintenanceService.list(),
        ]);

      const pending = allocations.filter((a) => a.status === 'pending_venue').length;
      const approved = allocations.filter((a) => a.status === 'approved').length;
      const openConflicts = conflicts.filter((c) => c.status !== 'resolved').length;
      const openMaint = maintenanceList.filter((i) => i.status === 'open').length;
      setStats({ pending, active: approved, conflicts: openConflicts, maintenance: openMaint });

      const today = new Date().toISOString().slice(0, 10);
      const upcoming = allocations
        .filter((a) => a.status === 'approved' && a.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5);
      setUpcomingBookings(upcoming);

      setRecentActivity(activity);

      const rows = venues.slice(0, 6).map((v) => {
        const todayBook = allocations.find((a) => a.venueId === v.venueId && a.date === today && a.status === 'approved');
        return {
          venueId: v.venueId,
          name: v.venueName,
          capacity: v.capacity || '—',
          status: v.status || 'available',
          todayEvent: todayBook ? todayBook.eventName : null,
          todayTime: todayBook ? `${todayBook.startTime}–${todayBook.endTime}` : null,
        };
      });
      setVenueRows(rows);

      const hp = allocations.find(
        (a) => a.status === 'pending_venue' && (a.priority === 'high' || a.priority === 'High')
      );
      setHighPriorityPending(hp || null);
    } catch (e) {
      setError(e.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const refresh = () => loadData();
    window.addEventListener('allocation-data-updated', refresh);
    return () => window.removeEventListener('allocation-data-updated', refresh);
  }, []);

  const actions = (
    <button type="button" className="es-btn es-btn--primary" onClick={() => navigate('/allocation-requests')}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
      Review requests
    </button>
  );

  if (loading) {
    return (
      <AllocationPageShell eyebrow="OFFICER DASHBOARD" title={title} subtitle={subtitle} actions={actions}>
        <div className="es-empty es-card">Loading dashboard…</div>
      </AllocationPageShell>
    );
  }

  return (
    <AllocationPageShell eyebrow="OFFICER DASHBOARD" title={title} subtitle={subtitle} actions={actions}>
      {error && (
        <div className="es-alert es-alert--danger" role="alert">
          {error}
        </div>
      )}
      <div className="ao-dash__stats">
        <div className="ao-dash__stat ao-dash__stat--featured">
          <div className="ao-dash__stat-top">
            <span className="ao-dash__stat-label">Pending requests</span>
          </div>
          <div className="ao-dash__stat-value">{stats.pending}</div>
          <div className="ao-dash__stat-hint">Require your action today</div>
        </div>
        <div className="ao-dash__stat ao-dash__stat--bookings">
          <div className="ao-dash__stat-top">
            <span className="ao-dash__stat-label">Active bookings</span>
            <span className="ao-dash__stat-icon" aria-hidden>
              🏛️
            </span>
          </div>
          <div className="ao-dash__stat-value ao-dash__stat-value--accent">{stats.active}</div>
          <div className="ao-dash__stat-hint">Venues locked this semester</div>
        </div>
        <div className="ao-dash__stat ao-dash__stat--conflict">
          <div className="ao-dash__stat-top">
            <span className="ao-dash__stat-label">Conflicts detected</span>
            <span className="ao-dash__stat-icon" aria-hidden>
              ⚠️
            </span>
          </div>
          <div className="ao-dash__stat-value ao-dash__stat-value--red">{stats.conflicts}</div>
          <div className="ao-dash__stat-hint">Need immediate resolution</div>
        </div>
        <div className="ao-dash__stat ao-dash__stat--maint">
          <div className="ao-dash__stat-top">
            <span className="ao-dash__stat-label">Maintenance issues</span>
            <span className="ao-dash__stat-icon" aria-hidden>
              🕐
            </span>
          </div>
          <div className="ao-dash__stat-value ao-dash__stat-value--amber">{stats.maintenance}</div>
          <div className="ao-dash__stat-hint">Affecting upcoming events</div>
        </div>
      </div>

      {stats.pending > 0 && (
        <div className="es-alert es-alert--urgent" role="status">
          <span className="ao-dash__alert-icon" aria-hidden>
            ⚠
          </span>
          <span>
            Action required: <strong>{stats.pending}</strong> venue request{stats.pending !== 1 && 's'} awaiting your decision.
            {highPriorityPending && (
              <>
                {' '}
                <strong className="ao-dash__alert-em">{highPriorityPending.eventName}</strong> is flagged as high priority.
              </>
            )}
          </span>
        </div>
      )}

      <div className="ao-dash__split">
        <section className="ao-dash__section es-card">
          <div className="ao-dash__section-head">
            <h2 className="ao-dash__section-title">Upcoming bookings this week</h2>
            <button type="button" className="ao-dash__link" onClick={() => navigate('/allocation-calendar')}>
              View calendar →
            </button>
          </div>
          {upcomingBookings.length === 0 ? (
            <p className="es-empty">No upcoming bookings.</p>
          ) : (
            <ul className="ao-dash__list">
              {upcomingBookings.map((booking, i) => (
                <li key={booking.bookingId} className="ao-dash__row">
                  <span className={`ao-dash__dot ${DOT_CLASS[i % DOT_CLASS.length]}`} aria-hidden />
                  <div className="ao-dash__row-main">
                    <div>
                      <strong>{booking.date}</strong>
                      {' — '}
                      <strong>{booking.eventName}</strong>
                      {' · '}
                      {booking.venueName} · {booking.startTime}–{booking.endTime}
                    </div>
                    <span className={`es-badge ${booking.status === 'approved' ? 'es-badge--purple' : 'es-badge--warning'}`}>
                      {booking.status === 'approved' ? 'Locked' : 'Pending'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="ao-dash__section es-card">
          <div className="ao-dash__section-head">
            <h2 className="ao-dash__section-title">Recent activity</h2>
          </div>
          {recentActivity.length === 0 ? (
            <p className="es-empty">No recent activity.</p>
          ) : (
            <ul className="ao-dash__activity">
              {recentActivity.map((act, idx) => (
                <li key={idx} className="ao-dash__activity-item">
                  <span className={`ao-dash__dot ${DOT_CLASS[idx % DOT_CLASS.length]}`} aria-hidden />
                  <div>
                    <p className="ao-dash__activity-msg">{act.message}</p>
                    <p className="ao-dash__activity-time">{act.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="ao-dash__section es-card ao-dash__venue-card">
        <div className="ao-dash__section-head">
          <h2 className="ao-dash__section-title">Venue status — today</h2>
          <button type="button" className="ao-dash__link" onClick={() => navigate('/allocation-venues')}>
            Manage all →
          </button>
        </div>
        <div className="ao-dash__table-wrap">
          <table className="ao-dash__table">
            <thead>
              <tr>
                <th>Venue</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Today&apos;s event</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {venueRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="ao-dash__table-empty">
                    Add venues under Venue Management to see status here.
                  </td>
                </tr>
              ) : (
                venueRows.map((row) => (
                  <tr key={row.venueId}>
                    <td>
                      <strong>{row.name}</strong>
                    </td>
                    <td>{row.capacity}</td>
                    <td>
                      <span className={`ao-dash__venue-status ao-dash__venue-status--${row.status}`}>{row.status}</span>
                    </td>
                    <td className="ao-dash__muted">
                      {row.todayEvent ? (
                        <>
                          {row.todayEvent}
                          <br />
                          <small>{row.todayTime}</small>
                        </>
                      ) : (
                        '— None today —'
                      )}
                    </td>
                    <td>
                      <button type="button" className="es-btn es-btn--secondary es-btn--sm" onClick={() => navigate('/allocation-venues')}>
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AllocationPageShell>
  );
}

export default AllocationOfficerDashboard;
