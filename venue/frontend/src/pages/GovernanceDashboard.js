import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/governance.css';

export function GovernanceDashboard() {
  const [activeView, setActiveView] = useState('dv-overview');
  const [modalOpen, setModalOpen] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [actionNotes, setActionNotes] = useState('');

  const { user, logout } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/api/gov/events');
      setEvents(res.data);
    } catch (err) {
      console.error('Error fetching gov events', err);
    }
  };

  const handleNav = (view, ev = null) => {
    if (ev) setSelectedEvent(ev);
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeModal = () => {
    setModalOpen(null);
    setActionNotes('');
  };

  const handleStatusUpdate = async (status) => {
    if (!selectedEvent) return;
    try {
      await axios.put(`/api/gov/events/${selectedEvent._id}/status`, {
        status,
        notes: actionNotes,
        reason: status === 'rejected' ? actionNotes : undefined
      });
      fetchEvents();
      closeModal();
      setActiveView('dv-queue');
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const pendingEvents = events.filter(e => e.status === 'sub' || e.status === 'review');
  const approvedEvents = events.filter(e => e.status === 'approved');
  const rejectedEvents = events.filter(e => e.status === 'rejected');
  const returnedEvents = events.filter(e => e.status === 'returned');

  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const isOverdue = (date) => new Date(date) < new Date();

  return (
    <>
      <header className="topbar">
        <div className="topbar-brand">
          <span className="brand-name">Event<em>Sync</em></span>
          <span className="brand-tag">Governance</span>
        </div>
        <div className="topbar-right">
          <button className="notif-btn" onClick={() => handleNav('dv-notifs')}>
            <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
            <div className="notif-dot"></div>
          </button>
          <div className="user-pill">
            <div className="user-av">GO</div>
            <div>
              <div className="user-name">{user?.name || 'Governance Officer'}</div>
              <div className="user-role">Student Affairs</div>
            </div>
          </div>
        </div>
      </header>

      <div className="app-shell">
        <nav className="sidebar">
          <div className="sidebar-inner">
            <div className="snav-section">Approval</div>
            <div className={`snav-item ${activeView === 'dv-overview' ? 'act' : ''}`} onClick={() => handleNav('dv-overview')}>
              <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
              Overview
            </div>
            <div className={`snav-item ${activeView === 'dv-queue' ? 'act' : ''}`} onClick={() => handleNav('dv-queue')}>
              <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
              Approval Queue <span className="snav-count">{pendingEvents.length}</span>
            </div>
            {selectedEvent && (
            <div className={`snav-item ${activeView === 'dv-review' ? 'act' : ''}`} onClick={() => handleNav('dv-review', selectedEvent)}>
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              Review Proposal
            </div>
            )}

            <div className="snav-section">Decisions</div>
            <div className={`snav-item ${activeView === 'dv-approved' ? 'act' : ''}`} onClick={() => handleNav('dv-approved')}>
              <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
              Approved <span className="snav-count" style={{ background: 'var(--em)' }}>{approvedEvents.length}</span>
            </div>
            <div className={`snav-item ${activeView === 'dv-rejected' ? 'act' : ''}`} onClick={() => handleNav('dv-rejected')}>
              <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              Rejected <span className="snav-count red">{rejectedEvents.length}</span>
            </div>
            <div className={`snav-item ${activeView === 'dv-returned' ? 'act' : ''}`} onClick={() => handleNav('dv-returned')}>
              <svg viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" /></svg>
              Returned <span className="snav-count amber">{returnedEvents.length}</span>
            </div>

            <div className="snav-section">Records</div>
            <div className={`snav-item ${activeView === 'dv-history' ? 'act' : ''}`} onClick={() => handleNav('dv-history')}>
              <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" /><polyline points="12 6 12 12 16 14" /></svg>
              Audit History
            </div>
            
            <div className="snav-divider"></div>
          </div>
          <div className="snav-bottom">
            <button className="snav-logout" onClick={() => { logout(); window.location.href='/login'; }}>
              <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              Log Out
            </button>
          </div>
        </nav>

        <main className="main-content">
          {activeView === 'dv-overview' && (
            <div className="dview act">
              <div className="page-header">
                <div>
                  <div className="eyebrow"><span className="eyebrow-dot"></span>Governance Portal</div>
                  <div className="page-title">Good morning, Officer 👋</div>
                  <div className="page-sub">{new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})} — Here's your approval dashboard</div>
                </div>
                <button className="btn btn-prim btn-lg" onClick={() => handleNav('dv-queue')}>View Approval Queue →</button>
              </div>

              <div className="stats-grid stats-4">
                <div className="stat-card dark"><div className="stat-label">Total In Queue</div><div className="stat-val">{pendingEvents.length}</div><div className="stat-meta">Awaiting your review</div></div>
                <div className="stat-card"><div className="stat-label">Approved</div><div className="stat-val stat-accent">{approvedEvents.length}</div><div className="stat-meta">Fully cleared</div></div>
                <div className="stat-card"><div className="stat-label">Returned</div><div className="stat-val" style={{ color: 'var(--amber)' }}>{returnedEvents.length}</div><div className="stat-meta">Awaiting resubmission</div></div>
                <div className="stat-card"><div className="stat-label">Rejected</div><div className="stat-val" style={{ color: 'var(--red)' }}>{rejectedEvents.length}</div><div className="stat-meta">This semester</div></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="card" style={{ marginBottom: 0 }}>
                  <div className="section-title">⚠️ SLA Alerts</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {pendingEvents.length === 0 ? (
                      <div style={{ padding: '11px 13px', borderRadius: 'var(--r-sm)', border: '1.5px solid var(--border)', color: 'var(--text-3)' }}>
                        No pending SLA alerts.
                      </div>
                    ) : pendingEvents.slice(0, 2).map((ev) => (
                      <div key={ev._id} style={{ padding: '11px 13px', borderRadius: 'var(--r-sm)', border: `1.5px solid ${isOverdue(ev.date) ? 'var(--red-bd)' : 'var(--amber-bd)'}`, background: isOverdue(ev.date) ? 'var(--red-lt)' : 'var(--amber-lt)' }}>
                        <div style={{ fontWeight: 700, fontSize: '.845rem', color: isOverdue(ev.date) ? 'var(--red)' : 'var(--amber)' }}>{ev.title}</div>
                        <div style={{ fontSize: '.74rem', color: isOverdue(ev.date) ? 'var(--red)' : 'var(--amber)', marginTop: '2px' }}>
                          {isOverdue(ev.date) ? '⚠️ Event date has passed or extremely urgent' : 'Needs review before date'}
                        </div>
                        <button className={`btn ${isOverdue(ev.date) ? 'btn-danger' : 'btn-amber'} btn-sm`} style={{ marginTop: '8px' }} onClick={() => handleNav('dv-review', ev)}>Review Now</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card" style={{ marginBottom: 0 }}>
                  <div className="section-title">Quick Actions</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button className="btn btn-prim btn-full" onClick={() => handleNav('dv-queue')}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M9 11l3 3L22 4" /></svg>Open Approval Queue ({pendingEvents.length})</button>
                    <button className="btn btn-sec btn-full" onClick={() => handleNav('dv-history')}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>View Audit History</button>
                  </div>
                </div>
              </div>

              <div className="card card-flush">
                <div className="card-header">
                  <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '.95rem' }}>Recent Proposals in Queue</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleNav('dv-queue')}>View All →</button>
                </div>
                <div className="tbl-wrap">
                  <table>
                    <thead><tr><th>Event</th><th>Organizer</th><th>Date</th><th>Status</th><th>Review</th></tr></thead>
                    <tbody>
                      {pendingEvents.length === 0 ? (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No pending proposals</td></tr>
                      ) : (
                        pendingEvents.slice(0, 5).map(ev => (
                          <tr key={ev._id}>
                            <td><div className="cell-name">{ev.title}</div><div className="cell-sub">{ev._id.substring(0, 8).toUpperCase()}</div></td>
                            <td style={{ fontSize: '.82rem' }}>{ev.user?.name || 'Unknown'}</td>
                            <td style={{ fontSize: '.82rem', color: 'var(--text-3)' }}>{formatDate(ev.date)}</td>
                            <td><span className="badge b-sub"><span className="bdot"></span>Submitted</span></td>
                            <td><button className="btn btn-prim btn-sm" onClick={() => handleNav('dv-review', ev)}>Review</button></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeView === 'dv-queue' && (
            <div className="dview act">
              <div className="page-header">
                <div><div className="eyebrow"><span className="eyebrow-dot"></span>Approval Queue</div><div className="page-title">Pending Proposals</div><div className="page-sub">{pendingEvents.length} proposals awaiting your review and decision</div></div>
              </div>
              
              {pendingEvents.length === 0 ? (
                <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
                  <h3 style={{ fontFamily: 'Fraunces, serif' }}>All caught up!</h3>
                  <p style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>There are no proposals awaiting your review right now.</p>
                </div>
              ) : (
                pendingEvents.map(ev => (
                  <div className="proposal-row" key={ev._id} onClick={() => handleNav('dv-review', ev)}>
                    <div className="pr-icon" style={{ background: 'var(--violet-lt)' }}>🎪</div>
                    <div className="pr-body">
                      <div className="pr-title">{ev.title}</div>
                      <div className="pr-meta">
                        <span>{ev.user?.name} · {ev.club || 'Club'}</span>
                        <span>📅 {formatDate(ev.date)}</span>
                        <span>👥 {ev.participants || 0} participants</span>
                      </div>
                    </div>
                    <div className="pr-right">
                      <span className="badge b-sub"><span className="bdot"></span>Submitted</span>
                      {isOverdue(ev.date) ? (
                        <div className="sla-wrap sla-over">
                          <div className="sla-label">⚠️ Date Passeed</div>
                          <div className="sla-bar"><div className="sla-fill" style={{ width: '100%' }}></div></div>
                        </div>
                      ) : (
                        <div className="sla-wrap sla-ok">
                          <div className="sla-label">Pending Review</div>
                          <div className="sla-bar"><div className="sla-fill" style={{ width: '40%' }}></div></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeView === 'dv-review' && selectedEvent && (
            <div className="dview act">
              <div className="page-header">
                <div>
                  <div className="eyebrow"><span className="eyebrow-dot"></span>Proposal Review</div>
                  <div className="page-title">{selectedEvent.title}</div>
                  <div className="page-sub">{selectedEvent._id.substring(0, 8).toUpperCase()} · {selectedEvent.user?.name} · {selectedEvent.club || 'Club'}</div>
                </div>
                <button className="btn btn-sec btn-sm" onClick={() => handleNav('dv-queue')}>← Back to Queue</button>
              </div>

              <div className="card" style={{ padding: '16px 20px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700, fontSize: '.85rem' }}>Approval Flow</div>
                  <span className="badge b-sub"><span className="bdot"></span>{selectedEvent.status === 'sub' || selectedEvent.status === 'review' ? 'Submitted — Pending Your Review' : selectedEvent.status}</span>
                </div>
                <div className="flow-bar">
                  <div className="flow-node done"><div className="fn-icon">📝</div><div className="fn-label">Submitted</div></div>
                  <div className="flow-arrow">→</div>
                  <div className={`flow-node ${selectedEvent.status === 'sub' || selectedEvent.status === 'review' ? 'active' : 'done'}`}><div className="fn-icon">⚖️</div><div className="fn-label">Gov. Review</div></div>
                  <div className="flow-arrow">→</div>
                  <div className={`flow-node ${selectedEvent.status === 'approved' ? 'done' : selectedEvent.status === 'rejected' ? 'rej' : selectedEvent.status === 'returned' ? 'ret' : 'pending'}`}>
                    <div className="fn-icon">{selectedEvent.status === 'approved' ? '✅' : selectedEvent.status === 'rejected' ? '❌' : '⏳'}</div>
                    <div className="fn-label">{selectedEvent.status === 'approved' ? 'Approved' : selectedEvent.status === 'rejected' ? 'Rejected' : selectedEvent.status === 'returned' ? 'Returned' : 'Decision'}</div>
                  </div>
                </div>
              </div>

              <div className="review-grid">
                <div>
                  <div className="card">
                    <div className="section-title">Event Details</div>
                    <div className="detail-row"><span className="detail-key">Event Type</span><span className="detail-val">{selectedEvent.type}</span></div>
                    <div className="detail-row"><span className="detail-key">Organizer</span><span className="detail-val">{selectedEvent.user?.name}</span></div>
                    <div className="detail-row"><span className="detail-key">Proposed Date</span><span className="detail-val">{formatDate(selectedEvent.date)}</span></div>
                    <div className="detail-row"><span className="detail-key">Time</span><span className="detail-val">{selectedEvent.startTime || 'Not set'} – {selectedEvent.endTime || 'Not set'}</span></div>
                    <div className="detail-row"><span className="detail-key">Venue</span><span className="detail-val">{selectedEvent.venue || 'TBD'}</span></div>
                    <div className="detail-row"><span className="detail-key">Participants</span><span className="detail-val"><strong>{selectedEvent.participants}</strong></span></div>
                    <div className="detail-row"><span className="detail-key">Description</span><span className="detail-val" style={{ maxWidth: 260 }}>{selectedEvent.description}</span></div>
                    <div className="detail-row"><span className="detail-key">Objectives</span><span className="detail-val" style={{ maxWidth: 260 }}>{selectedEvent.objectives}</span></div>
                    <div className="detail-row"><span className="detail-key">Est. Budget</span><span className="detail-val">Rs. {selectedEvent.totalEstimated || 0}</span></div>
                  </div>

                  {selectedEvent.documents && selectedEvent.documents.length > 0 && (
                    <div className="card">
                      <div className="section-title">Attached Documents</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedEvent.documents.map(doc => (
                           <div key={doc._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--surface-alt)', borderRadius: '6px' }}>
                             <div style={{ lineHeight: '1.2' }}><strong>{doc.type}</strong><br/><span style={{fontSize:'0.8rem', color:'var(--text-3)'}}>{doc.name}</span></div>
                             <a href={`http://localhost:5000${doc.url}`} target="_blank" rel="noopener noreferrer" className="btn btn-sec btn-sm">View File</a>
                           </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedEvent.expenses && selectedEvent.expenses.length > 0 && (
                    <div className="card">
                      <div className="section-title">Budget Breakdown</div>
                      <table style={{ width: '100%', fontSize: '0.85rem' }}>
                        <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}><th style={{ paddingBottom: 6 }}>Item Category</th><th style={{ paddingBottom: 6 }}>Est. Cost</th></tr></thead>
                        <tbody>
                          {selectedEvent.expenses.map(exp => (
                            <tr key={exp._id} style={{ borderBottom: '1px solid var(--border-md)' }}>
                              <td style={{ padding: '8px 0' }}><strong>{exp.category}</strong>: {exp.description}</td>
                              <td style={{ padding: '8px 0' }}>Rs. {exp.amount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {selectedEvent.resources && selectedEvent.resources.length > 0 && (
                    <div className="card">
                      <div className="section-title">Requested Resources</div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {selectedEvent.resources.map((res, i) => (
                          <span key={i} className="badge b-sub" style={{ background: 'var(--surface-alt)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>{res}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="action-panel">
                    <div className="action-panel-hd">
                      <div className="action-panel-title">Governance Decision</div>
                      <div className="action-panel-sub">Select an action below</div>
                    </div>
                    <div className="action-panel-body">
                      {selectedEvent.status === 'approved' ? (
                         <div className="alert alert-em">Already approved.</div>
                      ) : selectedEvent.status === 'rejected' ? (
                         <div className="alert alert-red">Already rejected.</div>
                      ) : (
                        <>
                          <button className="act-btn approve" onClick={() => setModalOpen('approved')}>
                            <div className="ab-icon" style={{ background: 'var(--em-lt)' }}>✅</div>
                            <div><div className="ab-title">Approve</div><div className="ab-desc">Mark as fully approved</div></div>
                          </button>
                          <button className="act-btn changes" onClick={() => setModalOpen('returned')}>
                            <div className="ab-icon" style={{ background: 'var(--amber-lt)' }}>🔁</div>
                            <div><div className="ab-title">Request Changes</div><div className="ab-desc">Return with your comments</div></div>
                          </button>
                          <button className="act-btn reject" onClick={() => setModalOpen('rejected')}>
                            <div className="ab-icon" style={{ background: 'var(--red-lt)' }}>❌</div>
                            <div><div className="ab-title">Reject</div><div className="ab-desc">Mandatory reason required</div></div>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {(activeView === 'dv-approved' || activeView === 'dv-rejected' || activeView === 'dv-returned') && (
            <div className="dview act">
              <div className="page-header">
                <div><div className="page-title">{activeView === 'dv-approved' ? 'Approved Proposals' : activeView === 'dv-rejected' ? 'Rejected Proposals' : 'Returned Proposals'}</div></div>
              </div>
              <div className="card card-flush">
                <div className="tbl-wrap">
                  <table>
                    <thead><tr><th>Event</th><th>Organizer</th><th>Date</th><th>Status</th><th>Review</th></tr></thead>
                    <tbody>
                      {events.filter(e => e.status === activeView.split('-')[1]).length === 0 ? (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No proposals found.</td></tr>
                      ) : (
                        events.filter(e => e.status === activeView.split('-')[1]).map(ev => (
                          <tr key={ev._id}>
                            <td><div className="cell-name">{ev.title}</div><div className="cell-sub">{ev._id.substring(0, 8).toUpperCase()}</div></td>
                            <td style={{ fontSize: '.82rem' }}>{ev.user?.name || 'Unknown'}</td>
                            <td style={{ fontSize: '.82rem', color: 'var(--text-3)' }}>{formatDate(ev.date)}</td>
                            <td><span className={`badge ${activeView === 'dv-approved' ? 'b-app' : activeView === 'dv-rejected' ? 'b-rej' : 'b-ret'}`}><span className="bdot"></span>{ev.status}</span></td>
                            <td><button className="btn btn-sec btn-sm" onClick={() => handleNav('dv-review', ev)}>View</button></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {modalOpen && (
        <div className="modal-bg open" onClick={e => { if (e.target.className.includes('modal-bg')) closeModal(); }}>
          <div className="modal">
            <div className="modal-hd">
              <div><div className="modal-title">{modalOpen === 'approved' ? '✅ Approve Proposal' : modalOpen === 'rejected' ? '❌ Reject Proposal' : '🔁 Return for Changes'}</div></div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">{modalOpen === 'rejected' ? 'Reason for Rejection *' : 'Comments / Notes (optional)'}</label>
                <textarea className="form-control" value={actionNotes} onChange={e => setActionNotes(e.target.value)} placeholder={`Add your ${modalOpen === 'rejected' ? 'reason' : 'notes'}…`}></textarea>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-sec" onClick={closeModal}>Cancel</button>
              <button className={`btn ${modalOpen === 'approved' ? 'btn-success' : modalOpen === 'rejected' ? 'btn-danger' : 'btn-amber'}`} onClick={() => handleStatusUpdate(modalOpen)}>Confirm Action</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
