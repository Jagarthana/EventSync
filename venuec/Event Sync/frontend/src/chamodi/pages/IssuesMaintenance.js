import React, { useState, useEffect } from 'react';
import AllocationPageShell from '../components/AllocationPageShell';
import { maintenanceService } from '../api/services';
import '../styles/IssuesMaintenance.css';

function IssuesMaintenance() {
  const [issues, setIssues] = useState([]);
  const [resolved, setResolved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ resource: '', location: '', description: '', affectsEvent: '' });

  const loadIssues = async () => {
    setError('');
    try {
      const { data } = await maintenanceService.list();
      setIssues(data.filter((i) => i.status !== 'resolved'));
      setResolved(data.filter((i) => i.status === 'resolved'));
    } catch (e) {
      setError(e.message || 'Failed to load issues');
      setIssues([]);
      setResolved([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await maintenanceService.create(form);
      window.dispatchEvent(new Event('allocation-data-updated'));
      await loadIssues();
      setShowForm(false);
      setForm({ resource: '', location: '', description: '', affectsEvent: '' });
    } catch (e) {
      alert(e.message || 'Could not report issue');
    }
  };

  const resolveIssue = async (id) => {
    try {
      await maintenanceService.update(id, { status: 'resolved' });
      window.dispatchEvent(new Event('allocation-data-updated'));
      await loadIssues();
    } catch (e) {
      alert(e.message || 'Could not resolve');
    }
  };

  const actions = (
    <button type="button" className="es-btn es-btn--primary" onClick={() => setShowForm(true)}>
      + Report issue
    </button>
  );

  return (
    <AllocationPageShell
      eyebrow="MAINTENANCE"
      title="Issues & maintenance"
      subtitle="Log, track, and resolve equipment faults and facility issues."
      actions={actions}
    >
      {error && (
        <div className="es-alert es-alert--danger" role="alert">
          {error}
        </div>
      )}
      {issues.length > 0 && (
        <div className="es-alert es-alert--warning" role="status">
          {issues.length} open issue{issues.length !== 1 && 's'} may affect events within the next 15 days. Prioritise resolution where needed.
        </div>
      )}

      {loading ? (
        <div className="es-empty es-card">Loading issues…</div>
      ) : (
        <>
          <section className="im-section">
            <h2 className="im-section__title">Open issues</h2>
            <div className="es-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Issue</th>
                    <th>Resource / venue</th>
                    <th>Reported</th>
                    <th>Affects event</th>
                    <th>Suggested fix</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="im-empty-cell">
                        No open issues.
                      </td>
                    </tr>
                  ) : (
                    issues.map((issue) => (
                      <tr key={issue.id}>
                        <td>
                          <strong>{issue.description}</strong>
                          <br />
                          <small className="im-muted">Reported by: {issue.reportedBy}</small>
                        </td>
                        <td>
                          {issue.resource} · {issue.location}
                        </td>
                        <td>{issue.reported}</td>
                        <td>{issue.affectsEvent || '—'}</td>
                        <td className="im-muted">Review &amp; schedule</td>
                        <td>
                          <span className="im-badge im-badge--open">Open</span>
                        </td>
                        <td>
                          <button type="button" className="es-btn es-btn--primary es-btn--sm" onClick={() => resolveIssue(issue.id)}>
                            Resolve
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="im-section">
            <h2 className="im-section__title">Resolved</h2>
            <div className="es-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Issue</th>
                    <th>Resolved</th>
                  </tr>
                </thead>
                <tbody>
                  {resolved.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="im-empty-cell">
                        No resolved issues yet.
                      </td>
                    </tr>
                  ) : (
                    resolved.map((issue) => (
                      <tr key={issue.id}>
                        <td>{issue.description}</td>
                        <td>{issue.resolvedAt || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {showForm && (
        <div className="es-modal-overlay" role="dialog" aria-modal="true">
          <div className="es-modal">
            <h3>Report issue</h3>
            <input name="resource" placeholder="Resource" value={form.resource} onChange={handleChange} />
            <input name="location" placeholder="Location" value={form.location} onChange={handleChange} />
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} rows={3} />
            <input name="affectsEvent" placeholder="Affects event (optional)" value={form.affectsEvent} onChange={handleChange} />
            <div className="es-modal-actions">
              <button type="button" className="es-btn es-btn--secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="button" className="es-btn es-btn--primary" onClick={handleSubmit}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </AllocationPageShell>
  );
}

export default IssuesMaintenance;
