import React, { useState, useEffect } from 'react';
import AllocationPageShell from '../components/AllocationPageShell';
import { allocationService } from '../api/services';
import '../styles/ApprovedBookings.css';

function ApprovedBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterVenue, setFilterVenue] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');

  const loadBookings = async () => {
    setError('');
    try {
      const { data: allocations } = await allocationService.list();
      const approved = allocations.filter((a) => a.status === 'approved');
      setBookings(approved);
    } catch (e) {
      setError(e.message || 'Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleRelease = async (bookingId) => {
    if (!window.confirm('Release this booking? Resources will become available again.')) return;
    try {
      await allocationService.updateStatus(bookingId, 'released');
      window.dispatchEvent(new Event('allocation-data-updated'));
      await loadBookings();
    } catch (e) {
      alert(e.message || 'Release failed');
    }
  };

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.eventName.toLowerCase().includes(search.toLowerCase()) || b.bookingId.toLowerCase().includes(search.toLowerCase());
    const matchesVenue = filterVenue === 'all' || b.venueName === filterVenue;
    const matchesMonth = filterMonth === 'all' || (b.date && b.date.slice(5, 7) === filterMonth);
    return matchesSearch && matchesVenue && matchesMonth;
  });

  const uniqueVenues = [...new Set(bookings.map((b) => b.venueName))];
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

  const exportCsv = () => {
    const header = ['Booking ID', 'Event', 'Organizer', 'Venue', 'Date', 'Time', 'Resources', 'Status'];
    const lines = [header.join(',')].concat(
      filtered.map((b) =>
        [
          b.bookingId,
          `"${(b.eventName || '').replace(/"/g, '""')}"`,
          b.studentEmail,
          `"${(b.venueName || '').replace(/"/g, '""')}"`,
          b.date,
          `${b.startTime}-${b.endTime}`,
          `"${((b.resources || []).map((r) => r.name).join('; ') || '').replace(/"/g, '""')}"`,
          'Locked',
        ].join(',')
      )
    );
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `approved-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AllocationPageShell
      eyebrow="APPROVED BOOKINGS"
      title="Confirmed allocations"
      subtitle="All locked venues and resources this semester."
      actions={
        <button type="button" className="es-btn es-btn--secondary" onClick={exportCsv}>
          Export CSV
        </button>
      }
    >
      {error && (
        <div className="es-alert es-alert--danger" role="alert">
          {error}
        </div>
      )}
      <div className="es-filters ab__filters">
        <input type="search" placeholder="Search bookings…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={filterVenue} onChange={(e) => setFilterVenue(e.target.value)} aria-label="Filter by venue">
          <option value="all">All venues</option>
          {uniqueVenues.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} aria-label="Filter by month">
          <option value="all">All months</option>
          {months.map((m) => (
            <option key={m} value={m}>
              Month {m}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="es-empty es-card">Loading bookings…</div>
      ) : (
        <div className="es-table-wrap ab__table">
          <table>
            <thead>
              <tr>
                <th>Booking</th>
                <th>Event</th>
                <th>Venue</th>
                <th>Date</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="ab__empty">
                    No approved bookings match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.bookingId}>
                    <td>{b.bookingId}</td>
                    <td>{b.eventName}</td>
                    <td>{b.venueName}</td>
                    <td>{b.date}</td>
                    <td>
                      {b.startTime}–{b.endTime}
                    </td>
                    <td>
                      <button type="button" className="es-btn es-btn--ghost-danger es-btn--sm" onClick={() => handleRelease(b.bookingId)}>
                        Release
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </AllocationPageShell>
  );
}

export default ApprovedBookings;
