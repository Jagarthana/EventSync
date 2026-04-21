import React, { useState, useEffect } from 'react';
import AllocationPageShell from '../components/AllocationPageShell';
import { venueService } from '../api/services';
import '../styles/VenueManagementOfficer.css';

function VenueManagementOfficer() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ venueName: '', capacity: '', location: '', status: 'available' });

  const loadVenues = async () => {
    setError('');
    try {
      const { data } = await venueService.list();
      setVenues(data);
    } catch (e) {
      setError(e.message || 'Failed to load venues');
      setVenues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVenues();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.venueName || !form.capacity) {
      alert('Fill required fields');
      return;
    }
    try {
      if (editing) {
        await venueService.update(editing.venueId, form);
      } else {
        await venueService.create(form);
      }
      await loadVenues();
      window.dispatchEvent(new Event('allocation-data-updated'));
      setShowForm(false);
      setEditing(null);
      setForm({ venueName: '', capacity: '', location: '', status: 'available' });
    } catch (e) {
      alert(e.message || 'Save failed');
    }
  };

  const handleEdit = (venue) => {
    setEditing(venue);
    setForm(venue);
    setShowForm(true);
  };

  const handleBlock = async (venueId) => {
    try {
      await venueService.update(venueId, { status: 'blocked' });
      await loadVenues();
      window.dispatchEvent(new Event('allocation-data-updated'));
    } catch (e) {
      alert(e.message || 'Update failed');
    }
  };

  const actions = (
    <button
      type="button"
      className="es-btn es-btn--primary"
      onClick={() => {
        setEditing(null);
        setForm({ venueName: '', capacity: '', location: '', status: 'available' });
        setShowForm(true);
      }}
    >
      + Add venue
    </button>
  );

  return (
    <AllocationPageShell
      eyebrow="VENUES"
      title="Venue management"
      subtitle="Manage status, capacity, and maintenance of all university venues."
      actions={actions}
    >
      {error && (
        <div className="es-alert es-alert--danger" role="alert">
          {error}
        </div>
      )}
      {loading ? (
        <div className="es-empty es-card">Loading venues…</div>
      ) : (
        <div className="vm-grid">
          {venues.length === 0 ? (
            <div className="es-empty es-card vm-empty">No venues yet. Add your first venue to get started.</div>
          ) : (
            venues.map((venue, i) => (
              <article key={venue.venueId} className="vm-card es-card">
                <div className={`vm-card__strip vm-card__strip--${i % 5}`} aria-hidden />
                <div className="vm-card__head">
                  <h3 className="vm-card__title">{venue.venueName}</h3>
                  <span className={`vm-badge vm-badge--${venue.status || 'available'}`}>{venue.status || 'available'}</span>
                </div>
                <p>
                  <strong>Location</strong> {venue.location || '—'}
                </p>
                <p>
                  <strong>Capacity</strong> {venue.capacity}
                </p>
                <p>
                  <strong>Utilisation</strong> {venue.utilisation || '0%'}
                </p>
                <div className="vm-card__actions">
                  <button type="button" className="es-btn es-btn--secondary es-btn--sm" onClick={() => handleEdit(venue)}>
                    Edit
                  </button>
                  <button type="button" className="es-btn es-btn--ghost-danger es-btn--sm" onClick={() => handleBlock(venue.venueId)}>
                    Block
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {showForm && (
        <div className="es-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="vm-modal-title">
          <div className="es-modal">
            <h3 id="vm-modal-title">{editing ? 'Edit venue' : 'Add venue'}</h3>
            <input name="venueName" placeholder="Venue name" value={form.venueName} onChange={handleChange} />
            <input name="capacity" placeholder="Capacity" value={form.capacity} onChange={handleChange} />
            <input name="location" placeholder="Location" value={form.location} onChange={handleChange} />
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="available">Available</option>
              <option value="blocked">Blocked</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <div className="es-modal-actions">
              <button type="button" className="es-btn es-btn--secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="button" className="es-btn es-btn--primary" onClick={handleSubmit}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </AllocationPageShell>
  );
}

export default VenueManagementOfficer;
