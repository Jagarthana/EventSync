import React, { useState, useEffect } from 'react';
import AllocationPageShell from '../components/AllocationPageShell';
import { conflictService } from '../api/services';
import '../styles/ConflictResolution.css';

function ConflictResolution() {
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadConflicts = async () => {
    setError('');
    try {
      const { data } = await conflictService.list();
      const open = data.filter((c) => c.status !== 'resolved');
      setConflicts(open);
    } catch (e) {
      setError(e.message || 'Failed to load conflicts');
      setConflicts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConflicts();
  }, []);

  const resolveConflict = async (conflictId, action) => {
    try {
      await conflictService.update(conflictId, { status: 'resolved', resolution: action });
      window.dispatchEvent(new Event('allocation-data-updated'));
      await loadConflicts();
      alert(`Conflict resolved: ${action}`);
    } catch (e) {
      alert(e.message || 'Update failed');
    }
  };

  const unresolvedCount = conflicts.length;

  return (
    <AllocationPageShell
      eyebrow="CONFLICTS"
      title="Conflict resolution"
      subtitle="Double-bookings, capacity issues, and scheduling overlaps across venue requests."
    >
      {error && (
        <div className="es-alert es-alert--danger" role="alert">
          {error}
        </div>
      )}
      {loading ? (
        <div className="cr-empty es-card">Loading conflicts…</div>
      ) : (
        <>
          {unresolvedCount > 0 && (
            <div className="cr-top-alert" role="alert">
              <div className="cr-top-alert__icon" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 9v4M12 17h.01" />
                  <path d="M10.3 3.2L2.7 18c-.5 1 0 2.2 1.1 2.5h16.4c1.1-.3 1.6-1.5 1.1-2.5L13.7 3.2c-.5-1-1.9-1-2.4 0z" />
                </svg>
              </div>
              <div>
                <strong className="cr-top-alert__title">{unresolvedCount} active conflict{unresolvedCount !== 1 && 's'}</strong>
                <p className="cr-top-alert__text">
                  Review both requests, pick a resolution path, or notify organisers. Resolved items leave this queue.
                </p>
              </div>
            </div>
          )}

          {conflicts.length === 0 ? (
            <div className="cr-empty es-card">No active conflicts. You&apos;re all clear.</div>
          ) : (
            conflicts.map((conflict) => {
              const ra = conflict.requestA || {};
              const rb = conflict.requestB || {};
              const sev = (conflict.severity || 'medium').toLowerCase();
              const kind = conflict.conflictType || 'Double booking';
              const capIssue =
                conflict.description && /capacity|overlap|overbook/i.test(conflict.description);

              return (
                <article key={conflict.id} className="cr-card">
                  <header className="cr-card__top">
                    <div>
                      <h2 className="cr-card__title">
                        Conflict #{conflict.id}
                        <span className="cr-card__title-sep"> — </span>
                        <span className="cr-card__title-kind">{kind}</span>
                      </h2>
                      {conflict.description && !capIssue && <p className="cr-card__lede">{conflict.description}</p>}
                    </div>
                    <div className="cr-card__badges">
                      <span className="cr-tag cr-tag--pink">• Unresolved</span>
                      <span className={`cr-tag cr-tag--sev cr-tag--sev-${sev}`}>
                        {sev === 'high' ? '↑ High' : sev === 'low' ? '↓ Low' : '◆ Medium'}
                      </span>
                    </div>
                  </header>

                  {capIssue && (
                    <div className="cr-inline-warn" role="status">
                      <span className="cr-inline-warn__icon" aria-hidden>
                        ⚠
                      </span>
                      <span>{conflict.description}</span>
                    </div>
                  )}

                  <div className="cr-compare">
                    <div className="cr-compare__box">
                      <h3 className="cr-compare__heading">Request A</h3>
                      <dl className="cr-dl">
                        <div className="cr-dl__row">
                          <dt>Event</dt>
                          <dd>{ra.eventName || '—'}</dd>
                        </div>
                        <div className="cr-dl__row">
                          <dt>Date</dt>
                          <dd>{ra.date || '—'}</dd>
                        </div>
                        <div className="cr-dl__row">
                          <dt>Time</dt>
                          <dd>{ra.time || `${ra.startTime || ''}–${ra.endTime || ''}` || '—'}</dd>
                        </div>
                        <div className="cr-dl__row">
                          <dt>Participants</dt>
                          <dd>{ra.pax ?? ra.participants ?? '—'}</dd>
                        </div>
                        <div className="cr-dl__row">
                          <dt>Organizer</dt>
                          <dd>{ra.organizer || ra.organiser || '—'}</dd>
                        </div>
                        <div className="cr-dl__row">
                          <dt>ID</dt>
                          <dd className="cr-dl__mono">{ra.id || ra.bookingId || '—'}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="cr-compare__divider" aria-hidden>
                      <span className="cr-compare__bolt">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                          <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
                        </svg>
                      </span>
                    </div>

                    <div className="cr-compare__box">
                      <h3 className="cr-compare__heading">Request B</h3>
                      <dl className="cr-dl">
                        <div className="cr-dl__row">
                          <dt>Event</dt>
                          <dd>{rb.eventName || '—'}</dd>
                        </div>
                        <div className="cr-dl__row">
                          <dt>Date</dt>
                          <dd>{rb.date || '—'}</dd>
                        </div>
                        <div className="cr-dl__row">
                          <dt>Time</dt>
                          <dd>{rb.time || `${rb.startTime || ''}–${rb.endTime || ''}` || '—'}</dd>
                        </div>
                        <div className="cr-dl__row">
                          <dt>Participants</dt>
                          <dd>{rb.pax ?? rb.participants ?? '—'}</dd>
                        </div>
                        <div className="cr-dl__row">
                          <dt>Organizer</dt>
                          <dd>{rb.organizer || rb.organiser || '—'}</dd>
                        </div>
                        <div className="cr-dl__row">
                          <dt>ID</dt>
                          <dd className="cr-dl__mono">{rb.id || rb.bookingId || '—'}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <footer className="cr-card__footer">
                    <button type="button" className="cr-res cr-res--venue" onClick={() => resolveConflict(conflict.id, 'Move to alternative venue')}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      Move to alternative venue
                    </button>
                    <button type="button" className="cr-res cr-res--time" onClick={() => resolveConflict(conflict.id, 'Reschedule time slot')}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                      Reschedule time slot
                    </button>
                    <button type="button" className="cr-res cr-res--notify" onClick={() => resolveConflict(conflict.id, 'Notify organiser to re-select')}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <path d="M22 6l-10 7L2 6" />
                      </svg>
                      Notify organiser
                    </button>
                    <button type="button" className="cr-res cr-res--reject" onClick={() => resolveConflict(conflict.id, 'Reject request')}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                      Reject request
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

export default ConflictResolution;
