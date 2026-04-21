import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/VenueDashboard.css';

export function VenueDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dv-overview');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'VO';

  return (
    <div className="vd-page-wrap">
      {/* TOPBAR - Unified System Look */}
      <header className="topbar">
        <div className="topbar-brand" onClick={() => setActiveView('dv-overview')}>
          <span className="brand-name">Event<em>Sync</em></span>
          <span className="brand-tag">Venue</span>
        </div>
        <div className="topbar-right">
          <div className="user-pill">
            <div className="user-av">{initials}</div>
            <div>
              <div className="user-name">{user?.name || 'Venue Officer'}</div>
              <div className="user-role">Facilities Management</div>
            </div>
          </div>
        </div>
      </header>

      <div className="app-shell">
        {/* SIDEBAR - Unified System Look */}
        <aside className="sidebar">
          <div className="sidebar-inner">
            <div className="snav-section">Dashboard</div>
            <div className={`snav-item ${activeView === 'dv-overview' ? 'act' : ''}`} onClick={() => setActiveView('dv-overview')}>
              <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
              Overview
            </div>

            <div className="snav-section">Requests</div>
            <div className={`snav-item ${activeView === 'dv-requests' ? 'act' : ''}`} onClick={() => setActiveView('dv-requests')}>
              <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /></svg>
              Incoming Requests <span className="snav-count amber">3</span>
            </div>
            <div className={`snav-item ${activeView === 'dv-conflicts' ? 'act' : ''}`} onClick={() => setActiveView('dv-conflicts')}>
              <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /></svg>
              Conflicts <span className="snav-count red">2</span>
            </div>

            <div className="snav-section">Manage</div>
            <div className={`snav-item ${activeView === 'dv-venues' ? 'act' : ''}`} onClick={() => setActiveView('dv-venues')}>
              <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              Venue List
            </div>
            <div className={`snav-item ${activeView === 'dv-inventory' ? 'act' : ''}`} onClick={() => setActiveView('dv-inventory')}>
              <svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
              Inventory
            </div>

            <div className="snav-divider"></div>
          </div>
          <div style={{ padding: '10px' }}>
            <button className="snav-logout" onClick={handleLogout}>
              <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              Log Out
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="main-content">
          {/* OVERVIEW */}
          {activeView === 'dv-overview' && (
            <div className="act">
              <div className="page-header">
                <div>
                  <div className="eyebrow"><span className="eyebrow-dot"></span>Venue Officer Portal</div>
                  <div className="page-title">Good morning, {user?.name || 'Officer'} 👋</div>
                  <div className="page-sub">{new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <button className="btn btn-prim" onClick={() => setActiveView('dv-requests')}>Review Requests →</button>
              </div>

              <div className="stats-grid">
                <div className="stat-card dark">
                  <div className="stat-label">Pending Requests</div>
                  <div className="stat-val">3</div>
                  <div className="stat-meta">Require action today</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Active Bookings</div>
                  <div className="stat-val" style={{ color: 'var(--vd-sec)' }}>11</div>
                  <div className="stat-meta">Locked this semester</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Conflicts</div>
                  <div className="stat-val" style={{ color: '#f43f5e' }}>2</div>
                  <div className="stat-meta">Immediate resolution needed</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Maintenance</div>
                  <div className="stat-val" style={{ color: '#d97706' }}>2</div>
                  <div className="stat-meta">Ongoing issues</div>
                </div>
              </div>

              <div className="card card-flush">
                <div className="card-header">
                  <span className="section-title" style={{ marginBottom: 0 }}>Venue Status Overview</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => setActiveView('dv-venues')}>Manage All →</button>
                </div>
                <div className="tbl-wrap">
                  <table>
                    <thead>
                      <tr><th>Venue</th><th>Capacity</th><th>Status</th><th>Events Today</th><th>Review</th></tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Main Auditorium</td>
                        <td>300</td>
                        <td><span className="badge b-approved"><span className="bdot"></span>Available</span></td>
                        <td>—</td>
                        <td><button className="btn btn-sec btn-sm">View</button></td>
                      </tr>
                      <tr>
                        <td>Lecture Hall A</td>
                        <td>150</td>
                        <td><span className="badge b-approved" style={{ background: '#ecfdf5', color: '#065f46' }}><span className="bdot" style={{ background: '#10b981' }}></span>Booked</span></td>
                        <td>Tech Workshop</td>
                        <td><button className="btn btn-sec btn-sm">View</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* REQUESTS VIEW */}
          {activeView === 'dv-requests' && (
            <div className="act">
              <div className="page-header">
                <div>
                  <div className="eyebrow"><span className="eyebrow-dot"></span>Request Queue</div>
                  <div className="page-title">Incoming Venue Requests</div>
                  <div className="page-sub">Review and allocate venues for proposed events</div>
                </div>
              </div>

              <div className="proposal-row">
                <div className="pr-body">
                  <div className="pr-title">Tech Innovation Workshop 2026</div>
                  <div className="pr-meta">
                    <span>Organizer: John Smith</span>
                    <span>📍 Main Auditorium</span>
                    <span>📅 April 10, 2026</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="badge b-high">High Priority</span>
                  <button className="btn btn-prim btn-sm">Approve</button>
                  <button className="btn btn-sec btn-sm" onClick={() => setIsModalOpen(true)}>Details</button>
                </div>
              </div>
              {/* More rows... */}
            </div>
          )}

          {/* Fallback for other views */}
          {activeView !== 'dv-overview' && activeView !== 'dv-requests' && (
            <div className="act">
              <div className="page-header">
                <div>
                  <div className="page-title">{activeView.replace('dv-', '').toUpperCase()}</div>
                  <div className="page-sub">System integration in progress</div>
                </div>
              </div>
              <div className="card">
                <p>Functional integration for this module is currently under development. Please check back later.</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-bg">
          <div className="modal">
            <div className="modal-hd">
              <div className="modal-title">Request Adjustment</div>
              <button style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '15px' }}>
                <label className="section-title">Message to Organizer</label>
                <textarea style={{ width: '100%', minHeight: '100px', padding: '10px', borderRadius: '8px', border: '1px solid var(--vd-border)' }} placeholder="e.g. Please consider Hall B as the Auditorium is booked."></textarea>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-sec" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn btn-prim" onClick={() => setIsModalOpen(false)}>Send Suggestion</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
