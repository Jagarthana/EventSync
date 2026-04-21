import React, { useState, useEffect } from 'react';
import AllocationPageShell from '../components/AllocationPageShell';
import { allocationService, preEventService } from '../api/services';
import '../styles/PreEventPrep.css';

function PreEventPrep() {
  const [events, setEvents] = useState([]);
  const [checklists, setChecklists] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUpcomingEvents = async () => {
    setError('');
    try {
      const [{ data: allocations }, { data: checklistMap }] = await Promise.all([
        allocationService.list(),
        preEventService.getAll(),
      ]);
      const today = new Date().toISOString().slice(0, 10);
      const upcoming = allocations.filter((a) => a.status === 'approved' && a.date >= today);
      setEvents(upcoming);
      setChecklists(checklistMap || {});
    } catch (e) {
      setError(e.message || 'Failed to load data');
      setEvents([]);
      setChecklists({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUpcomingEvents();
  }, []);

  const toggleChecklistItem = async (eventId, itemIndex, totalItems) => {
    const base = [...(checklists[eventId] || Array(totalItems).fill(false))];
    while (base.length < totalItems) base.push(false);
    base[itemIndex] = !base[itemIndex];
    const updated = { ...checklists, [eventId]: base };
    setChecklists(updated);
    try {
      await preEventService.put(eventId, updated[eventId]);
      window.dispatchEvent(new Event('allocation-data-updated'));
    } catch (e) {
      alert(e.message || 'Could not save checklist');
    }
  };

  const saveChecklist = () => {
    alert('Checklist saved.');
  };

  const sendProgress = () => {
    alert('Progress sent to organizer.');
  };

  const res = (event) => event.resources || [];

  return (
    <AllocationPageShell
      eyebrow="PRE-EVENT"
      title="Pre-event preparation"
      subtitle="Facilities checklist for upcoming confirmed events."
    >
      {error && (
        <div className="es-alert es-alert--danger" role="alert">
          {error}
        </div>
      )}
      {loading ? (
        <div className="es-empty es-card">Loading events…</div>
      ) : events.length === 0 ? (
        <div className="es-empty es-card pep__empty">No upcoming confirmed events.</div>
      ) : (
        events.map((event) => {
          const checklistTemplate = [
            `Confirm ${event.venueName} booking is locked in system`,
            `Arrange ${res(event).find((r) => r.name?.includes('Seating'))?.quantity || 50} extra chairs in ${event.eventType === 'Workshop' ? 'theatre-style' : 'layout'}`,
            `PA system pre-check and calibration (scheduled)`,
            `Test both projectors (#1 and #2)`,
            `Set up registration desk at entrance with signage`,
            `Deploy ${res(event).find((r) => r.name?.includes('Technician'))?.quantity || 2} AV technicians on ${event.date} from ${event.startTime}`,
            `Notify security team for event coverage`,
            `Confirm teardown schedule: ${event.date}, ${event.endTime} onwards`,
          ];
          return (
            <article key={event.bookingId} className="pep-card es-card">
              <div className="pep-card__head">
                <div>
                  <h3 className="pep-card__title">{event.eventName}</h3>
                  <p className="pep-card__meta">
                    {event.date} · {event.venueName} · {event.studentEmail}
                  </p>
                </div>
                <span className="pep-pill">{Math.ceil((new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24))} days to event</span>
              </div>
              <h4 className="pep-checklist__title">Venue setup checklist</h4>
              <div className="pep-checklist">
                {checklistTemplate.map((item, idx) => {
                  const done = checklists[event.bookingId]?.[idx];
                  return (
                    <label key={idx} className={`pep-item ${done ? 'pep-item--done' : 'pep-item--pending'}`}>
                      <input
                        type="checkbox"
                        checked={done || false}
                        onChange={() => toggleChecklistItem(event.bookingId, idx, checklistTemplate.length)}
                      />
                      <span className={done ? 'pep-item__text pep-item__text--done' : 'pep-item__text'}>{item}</span>
                      <span className="pep-item__who">
                        Assigned:{' '}
                        {idx === 0 ? 'K. Perera' : idx === 1 ? 'Facilities Team' : idx === 2 ? 'AV Tech #2' : idx === 3 ? 'AV Tech #1' : 'Security Team'}
                      </span>
                      <span className="pep-item__status">{done ? 'Done' : 'Pending'}</span>
                    </label>
                  );
                })}
              </div>
              <div className="pep-actions">
                <button type="button" className="es-btn es-btn--secondary" onClick={saveChecklist}>
                  Save checklist
                </button>
                <button type="button" className="es-btn es-btn--primary" onClick={sendProgress}>
                  Send progress to organizer
                </button>
              </div>
            </article>
          );
        })
      )}
    </AllocationPageShell>
  );
}

export default PreEventPrep;
