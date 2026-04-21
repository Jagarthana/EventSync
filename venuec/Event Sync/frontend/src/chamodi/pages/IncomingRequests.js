import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AllocationPageShell from '../components/AllocationPageShell';
import { allocationService, studentBookingService, venueService, activityService } from '../api/services';
import '../styles/IncomingRequests.css';

function IncomingRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [conflictMap, setConflictMap] = useState({});
  const [alternativesById, setAlternativesById] = useState({});
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRequests = async () => {
    setError('');
    try {
      const { data: allocations } = await allocationService.list();
      const pending = allocations.filter((a) => a.status === 'pending_venue');
      setRequests(pending);
    } catch (e) {
      setError(e.message || 'Failed to load requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    if (!requests.length) {
      setConflictMap({});
      setAlternativesById({});
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [{ data: studentBookings }, { data: venues }] = await Promise.all([
          studentBookingService.list(),
          venueService.list(),
        ]);
        if (cancelled) return;
        const map = {};
        const alts = {};
        requests.forEach((req) => {
          const hit = studentBookings.find(
            (b) => b.status === 'confirm' && b.eventDate === req.date && b.venueName === req.venueName
          );
          map[req.bookingId] = !!hit;
          if (hit) {
            alts[req.bookingId] = venues.filter(
              (v) => v.venueName !== req.venueName && Number(v.capacity || 0) >= Number(req.participants || 0)
            );
          }
        });
        setConflictMap(map);
        setAlternativesById(alts);
      } catch {
        if (!cancelled) {
          setConflictMap({});
          setAlternativesById({});
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const p = (r.priority || 'normal').toLowerCase();
      if (priorityFilter === 'all') return true;
      if (priorityFilter === 'high') return p === 'high';
      return p === 'normal' || p === 'low' || !r.priority;
    });
  }, [requests, priorityFilter]);

  const handleApprove = async (request) => {
    if (conflictMap[request.bookingId]) {
      alert('Please resolve conflicts before approving.');
      return;
    }
    try {
      await allocationService.updateStatus(request.bookingId, 'approved');
      await activityService.create({
        message: `You approved ${request.venueName} for ${request.eventName}.`,
      });
      window.dispatchEvent(new Event('allocation-data-updated'));
      await loadRequests();
    } catch (e) {
      alert(e.message || 'Approve failed');
    }
  };

  const handleReject = async (request) => {
    if (!window.confirm('Reject this request?')) return;
    try {
      await allocationService.updateStatus(request.bookingId, 'rejected');
      await activityService.create({
        message: `You rejected ${request.venueName} for ${request.eventName} (${request.bookingId}).`,
      });
      window.dispatchEvent(new Event('allocation-data-updated'));
      await loadRequests();
    } catch (e) {
      alert(e.message || 'Reject failed');
    }
  };

  const handleSuggestAdjustment = (req) => {
    alert(`Suggest adjustment for "${req?.eventName || 'this event'}": change venue, time, or participants.`);
  };

  const exportQueue = () => {
    const header = ['Booking ID', 'Event', 'Venue', 'Date', 'Time', 'Participants', 'Priority'];
    const lines = [header.join(',')].concat(
      requests.map((r) =>
        [
          r.bookingId,
          `"${(r.eventName || '').replace(/"/g, '""')}"`,
          `"${(r.venueName || '').replace(/"/g, '""')}"`,
          r.date,
          `${r.startTime}-${r.endTime}`,
          r.participants,
          r.priority || 'normal',
        ].join(',')
      )
    );
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incoming-requests-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const actions = (
    <div className="ir-toolbar">
      <label className="ir-toolbar__field">
        <span className="ir-toolbar__label">Priority</span>
        <select
          className="ir-toolbar__select"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          aria-label="Filter by priority"
        >
          <option value="all">All priorities</option>
          <option value="high">High priority</option>
          <option value="normal">Normal / low</option>
        </select>
      </label>
      <button type="button" className="ir-btn ir-btn--export" onClick={exportQueue}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
        Export queue
      </button>
    </div>
  );

  return (
    <AllocationPageShell
      eyebrow="INCOMING REQUESTS"
      title="Incoming venue requests"
      subtitle="Review, validate, and allocate venues and resources for approved events."
      actions={actions}
    >
      {error && (
        <div className="es-alert es-alert--danger" role="alert">
          {error}
        </div>
      )}
      {loading ? (
        <div className="ir-empty es-card">Loading requests…</div>
      ) : (
        <>
          {requests.length > 0 && (
            <div className="ir-banner" role="status">
              <div className="ir-banner__icon" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              </div>
              <div className="ir-banner__text">
                <strong>{requests.length}</strong> pending request{requests.length !== 1 && 's'}. The system has automatically run conflict checks — review each card
                before approving or rejecting.
              </div>
            </div>
          )}

          {requests.length === 0 ? (
            <div className="ir-empty es-card">No pending requests in the queue.</div>
          ) : filteredRequests.length === 0 ? (
            <div className="ir-empty es-card">No requests match the selected priority filter.</div>
          ) : (
            filteredRequests.map((req) => {
              const hasConflict = !!conflictMap[req.bookingId];
              const alts = alternativesById[req.bookingId] || [];
              const isHigh = (req.priority || '').toLowerCase() === 'high';
              const resources = Array.isArray(req.resources) ? req.resources : [];

              return (
                <article key={req.bookingId} className="ir-card">
                  <header className="ir-card__header">
                    <div className="ir-card__title-block">
                      <h2 className="ir-card__title">{req.eventName}</h2>
                      <p className="ir-card__meta">
                        Submitted by <strong>{req.studentEmail}</strong>
                        {req.requestedAt && (
                          <>
                            {' '}
                            · {req.requestedAt}
                          </>
                        )}{' '}
                        · <span className="ir-card__ref">{req.bookingId}</span>
                      </p>
                    </div>
                    <div className="ir-card__badges" aria-label="Status">
                      {isHigh && <span className="ir-pill ir-pill--danger">High priority</span>}
                      {!isHigh && <span className="ir-pill ir-pill--neutral">Normal priority</span>}
                      <span className="ir-pill ir-pill--amber">Awaiting decision</span>
                      {hasConflict ? (
                        <span className="ir-pill ir-pill--conflict">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                            <path d="M12 9v4M12 17h.01" />
                            <path d="M10.3 3.2L2.7 18c-.5 1 0 2.2 1.1 2.5h16.4c1.1-.3 1.6-1.5 1.1-2.5L13.7 3.2c-.5-1-1.9-1-2.4 0z" />
                          </svg>
                          Conflict detected
                        </span>
                      ) : (
                        <span className="ir-pill ir-pill--ok">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                          No conflicts
                        </span>
                      )}
                    </div>
                  </header>

                  <div className="ir-detail-grid">
                    <div className="ir-detail-grid__cell">
                      <span className="ir-detail-grid__label">Venue requested</span>
                      <span className="ir-detail-grid__value">{req.venueName}</span>
                    </div>
                    <div className="ir-detail-grid__cell">
                      <span className="ir-detail-grid__label">Event date</span>
                      <span className="ir-detail-grid__value">{req.date}</span>
                    </div>
                    <div className="ir-detail-grid__cell">
                      <span className="ir-detail-grid__label">Time slot</span>
                      <span className="ir-detail-grid__value">
                        {req.startTime} – {req.endTime}
                      </span>
                    </div>
                    <div className="ir-detail-grid__cell">
                      <span className="ir-detail-grid__label">Participants</span>
                      <span className="ir-detail-grid__value">{req.participants}</span>
                    </div>
                    <div className="ir-detail-grid__cell">
                      <span className="ir-detail-grid__label">Event type</span>
                      <span className="ir-detail-grid__value">{req.eventType || '—'}</span>
                    </div>
                  </div>

                  {resources.length > 0 && (
                    <div className="ir-resources">
                      <span className="ir-resources__label">Resources</span>
                      <div className="ir-resources__tags">
                        {resources.map((r, i) => (
                          <span key={i} className="ir-chip">
                            <span className="ir-chip__icon" aria-hidden>
                              📦
                            </span>
                            {r.name}
                            {r.quantity != null ? ` ×${r.quantity}` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {req.internalNotes && (
                    <div className="ir-notes">
                      <span className="ir-notes__label">Internal notes</span>
                      <p className="ir-notes__text">{req.internalNotes}</p>
                    </div>
                  )}

                  {hasConflict && (
                    <div className="ir-conflict" role="alert">
                      <div className="ir-conflict__icon" aria-hidden>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 9v4M12 17h.01" />
                          <path d="M10.3 3.2L2.7 18c-.5 1 0 2.2 1.1 2.5h16.4c1.1-.3 1.6-1.5 1.1-2.5L13.7 3.2c-.5-1-1.9-1-2.4 0z" />
                        </svg>
                      </div>
                      <div>
                        <strong className="ir-conflict__title">Scheduling conflict</strong>
                        <p className="ir-conflict__msg">
                          <strong>{req.venueName}</strong> may already be booked for this time slot. Overlap detected — resolve before approving.
                        </p>
                      </div>
                    </div>
                  )}

                  {hasConflict && alts.length > 0 && (
                    <div className="ir-suggest">
                      <span className="ir-suggest__label">Suggested alternatives</span>
                      <ul className="ir-suggest__list">
                        {alts.slice(0, 3).map((v) => (
                          <li key={v.venueId}>
                            {v.venueName} <span className="ir-suggest__cap">(capacity {v.capacity})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <footer className="ir-card__footer">
                    <div className="ir-card__actions">
                      <button type="button" className="ir-action ir-action--approve" onClick={() => handleApprove(req)} disabled={hasConflict}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        Approve &amp; lock venue
                      </button>
                      <button type="button" className="ir-action ir-action--adjust" onClick={() => handleSuggestAdjustment(req)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                          <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                        Suggest adjustment
                      </button>
                      <button type="button" className="ir-action ir-action--reject" onClick={() => handleReject(req)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                        Reject
                      </button>
                    </div>
                    <button type="button" className="ir-calendar-link" onClick={() => navigate('/allocation-calendar')}>
                      View in calendar
                      <span aria-hidden> →</span>
                    </button>
                  </footer>
                </article>
              );
            })
          )}
        </>
      )}
    </AllocationPageShell>
  );
}

export default IncomingRequests;
