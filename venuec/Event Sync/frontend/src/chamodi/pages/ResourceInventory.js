import React, { useState, useEffect } from 'react';
import AllocationPageShell from '../components/AllocationPageShell';
import { equipmentService } from '../api/services';
import '../styles/ResourceInventory.css';

function ResourceInventory() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    resourceName: '',
    category: '',
    total: '',
    available: '',
    inUse: '',
    underMaintenance: '',
    status: 'available',
  });

  const loadResources = async () => {
    setError('');
    try {
      const { data } = await equipmentService.list();
      setResources(data);
    } catch (e) {
      setError(e.message || 'Failed to load inventory');
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const newResource = {
      ...form,
      equipmentName: form.resourceName,
      cost: 0,
    };
    try {
      await equipmentService.create(newResource);
      await loadResources();
      window.dispatchEvent(new Event('allocation-data-updated'));
      setShowForm(false);
      setForm({
        resourceName: '',
        category: '',
        total: '',
        available: '',
        inUse: '',
        underMaintenance: '',
        status: 'available',
      });
    } catch (e) {
      alert(e.message || 'Could not add resource');
    }
  };

  const actions = (
    <button type="button" className="es-btn es-btn--primary" onClick={() => setShowForm(true)}>
      + Add resource
    </button>
  );

  const categories = [...new Set(resources.map((r) => r.category).filter(Boolean))];

  const filtered = resources.filter((r) => {
    const q = search.toLowerCase();
    const matchQ =
      !q ||
      (r.equipmentName || '').toLowerCase().includes(q) ||
      (r.category || '').toLowerCase().includes(q);
    const matchC = catFilter === 'all' || r.category === catFilter;
    const matchS = statusFilter === 'all' || (r.status || 'available') === statusFilter;
    return matchQ && matchC && matchS;
  });

  return (
    <AllocationPageShell
      eyebrow="INVENTORY"
      title="Resource inventory"
      subtitle="Track availability, condition, and allocation of all resources."
      actions={actions}
    >
      {error && (
        <div className="es-alert es-alert--danger" role="alert">
          {error}
        </div>
      )}
      <div className="es-filters ri__filters">
        <input
          type="search"
          placeholder="Search resources…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search resources"
        />
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} aria-label="Category">
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Status">
          <option value="all">All statuses</option>
          <option value="available">Available</option>
          <option value="in_use">In use</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>
      {loading ? (
        <div className="es-empty es-card">Loading resources…</div>
      ) : (
        <div className="es-table-wrap ri__table">
          <table>
            <thead>
              <tr>
                <th>Resource</th>
                <th>Category</th>
                <th>Total units</th>
                <th>Available</th>
                <th>In use</th>
                <th>Under maint.</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.length === 0 ? (
                <tr>
                  <td colSpan={8} className="ri__empty-cell">
                    No resources recorded yet.
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="ri__empty-cell">
                    No resources match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.equipmentId}>
                    <td>{r.equipmentName}</td>
                    <td>{r.category || '—'}</td>
                    <td>{r.total || r.quantity || 1}</td>
                    <td>{r.available || r.quantity || 1}</td>
                    <td>{r.inUse || 0}</td>
                    <td>{r.underMaintenance || 0}</td>
                    <td>
                      <span className="ri-status">{r.status || 'available'}</span>
                    </td>
                    <td>
                      <button type="button" className="es-btn es-btn--secondary es-btn--sm">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="es-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="ri-modal-title">
          <div className="es-modal">
            <h3 id="ri-modal-title">Add new resource</h3>
            <input name="resourceName" placeholder="Resource name" value={form.resourceName} onChange={handleChange} />
            <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
            <input name="total" placeholder="Total units" value={form.total} onChange={handleChange} />
            <input name="available" placeholder="Available" value={form.available} onChange={handleChange} />
            <div className="es-modal-actions">
              <button type="button" className="es-btn es-btn--secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="button" className="es-btn es-btn--primary" onClick={handleSubmit}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </AllocationPageShell>
  );
}

export default ResourceInventory;
