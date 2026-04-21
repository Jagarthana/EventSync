import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/finance.css';

export function FinanceDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dv-overview');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEventName, setModalEventName] = useState('');
  const [showAnnBar, setShowAnnBar] = useState(true);
  const [allocInfo, setAllocInfo] = useState('');

  const handleLogOut = () => {
    logout();
    navigate('/login');
  };

  const handleNav = (view) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openApproveModal = (eventName) => {
    setModalEventName(eventName);
    setModalOpen(true);
  };

  const updateAllocInfo = (val) => {
    setAllocInfo(val);
  };

  return (
    <div className="fin-app">
      {/* ANN BAR */}
      {showAnnBar && (
        <div className="ann-bar">
          <span className="ann-pill">Action Required</span>
          You have <strong style={{ color: '#f9a8c4' }}>4 budget requests</strong> pending আর্থিক review —
          <a onClick={() => handleNav('dv-review')}>Review now →</a>
          <span className="ann-close" onClick={() => setShowAnnBar(false)}>✕</span>
        </div>
      )}

      {/* TOPBAR */}
      <header className="fin-topbar">
        <div className="fin-topbar-brand">
          <span className="fin-brand-name">Event<em>Sync</em></span>
        </div>
        <nav className="fin-topbar-center">
          <button className="fin-tnav">Home</button>
          <button className="fin-tnav">Events</button>
          <button className="fin-tnav">Reports</button>
          <button className="fin-tnav">Help</button>
        </nav>
        <div className="fin-topbar-user">
          <span className="fin-topbar-role-badge">Finance Officer</span>
          <div className="fin-notif-btn"><svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg><div className="fin-notif-dot"></div></div>
          <div className="fin-topbar-avatar">NP</div>
          <span className="fin-topbar-uname">{user?.name || 'Nadia Perera'}</span>
          <button className="fin-btn-logout-top" onClick={handleLogOut}>Log Out</button>
        </div>
      </header>

      {/* DASHBOARD */}
      <div className="fin-main-pad">
        <div className="fin-wrap">
          <div className="fin-dash-layout">

            {/* SIDEBAR */}
            <aside className="fin-sidebar">
              <div className="fin-sidebar-card">
                <div className="fin-sidebar-user">
                  <div className="fin-su-avatar">NP</div>
                  <div className="fin-su-name">{user?.name || 'Nadia Perera'}</div>
                  <div className="fin-su-role">Finance Division</div>
                  <div className="fin-su-badge"><span className="fin-su-badge-dot"></span>Finance Officer</div>
                </div>
                <nav className="fin-sidebar-nav">
                  <div className="fin-snav-section">Main</div>
                  <div className={`fin-snav-item ${activeView === 'dv-overview' ? 'act' : ''}`} onClick={() => handleNav('dv-overview')}>
                    <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>Overview
                  </div>
                  <div className={`fin-snav-item ${activeView === 'dv-review' ? 'act' : ''}`} onClick={() => handleNav('dv-review')}>
                    <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>Budget Reviews
                    <span className="fin-snav-badge">4</span>
                  </div>
                  <div className={`fin-snav-item ${activeView === 'dv-allocate' ? 'act' : ''}`} onClick={() => handleNav('dv-allocate')}>
                    <svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>Allocate Budget
                  </div>
                  <div className="fin-snav-section" style={{ marginTop: '4px' }}>Reports & Records</div>
                  <div className={`fin-snav-item ${activeView === 'dv-expenses' ? 'act' : ''}`} onClick={() => handleNav('dv-expenses')}>
                    <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>Expense Tracker
                  </div>
                  <div className={`fin-snav-item ${activeView === 'dv-reports' ? 'act' : ''}`} onClick={() => handleNav('dv-reports')}>
                    <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>Final Reports
                    <span className="fin-snav-badge fin-amber">2</span>
                  </div>
                  <div className={`fin-snav-item ${activeView === 'dv-history' ? 'act' : ''}`} onClick={() => handleNav('dv-history')}>
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>Transaction History
                  </div>
                  <div className="fin-snav-divider"></div>
                  <div className="fin-snav-logout" onClick={handleLogOut}>
                    <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>Log Out
                  </div>
                </nav>
              </div>
            </aside>

            {/* CONTENT */}
            <div className="fin-dcontent">

              {/* OVERVIEW */}
              <div className={`fin-dview ${activeView === 'dv-overview' ? 'act' : ''}`}>
                <div className="fin-dview-header">
                  <div>
                    <div className="fin-eyebrow"><span className="fin-eyebrow-dot"></span>Finance Dashboard</div>
                    <div className="fin-dview-title">Good morning, {user?.name?.split(' ')[0] || 'Nadia'} 👋</div>
                    <div className="fin-dview-sub">{new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} — Financial overview for all active events</div>
                  </div>
                  <button className="fin-btn fin-btn-prim" onClick={() => handleNav('dv-review')}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 11l3 3L22 4" /></svg>Review Budgets
                  </button>
                </div>

                <div className="fin-stats-4">
                  <div className="fin-stat-card dark">
                    <div className="fin-stat-label">Total Allocated</div>
                    <div className="fin-stat-val">LKR 1.2M</div>
                    <div className="fin-stat-change">Across 18 events</div>
                  </div>
                  <div className="fin-stat-card">
                    <div className="fin-stat-icon em"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg></div>
                    <div className="fin-stat-label">Total Spent</div>
                    <div className="fin-stat-val">LKR 840K</div>
                    <div className="fin-stat-change">70% of allocated</div>
                  </div>
                  <div className="fin-stat-card">
                    <div className="fin-stat-icon amber"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg></div>
                    <div className="fin-stat-label">Pending Reviews</div>
                    <div className="fin-stat-val">4</div>
                    <div className="fin-stat-change">Awaiting your action</div>
                  </div>
                  <div className="fin-stat-card">
                    <div className="fin-stat-icon red"><svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /></svg></div>
                    <div className="fin-stat-label">Over Budget</div>
                    <div className="fin-stat-val">2</div>
                    <div className="fin-stat-change">Events exceeding limit</div>
                  </div>
                </div>

                {/* CHART & QA */}
                <div className="fin-qa-grid">
                  <div className="fin-qa-card" onClick={() => handleNav('dv-review')}><div className="fin-qa-icon-wrap"><svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4" /></svg></div><div><div className="fin-qa-card-title">Review Budgets</div><div className="fin-qa-card-desc">4 requests pending approval</div></div></div>
                  <div className="fin-qa-card" onClick={() => handleNav('dv-allocate')}><div className="fin-qa-icon-wrap"><svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg></div><div><div className="fin-qa-card-title">Allocate Budget</div><div className="fin-qa-card-desc">Set allocations for new events</div></div></div>
                  <div className="fin-qa-card" onClick={() => handleNav('dv-reports')}><div className="fin-qa-icon-wrap"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg></div><div><div className="fin-qa-card-title">Verify Final Reports</div><div className="fin-qa-card-desc">2 post-event reports awaiting sign-off</div></div></div>
                </div>
              </div>

              {/* BUDGET REVIEWS */}
              <div className={`fin-dview ${activeView === 'dv-review' ? 'act' : ''}`}>
                <div className="fin-dview-header">
                  <div>
                    <div className="fin-eyebrow"><span className="fin-eyebrow-dot"></span>Reviews</div>
                    <div className="fin-dview-title">Budget Review Queue</div>
                    <div className="fin-dview-sub">4 budget requests pending your financial review and approval</div>
                  </div>
                  <div className="fin-pill-tabs" style={{ marginBottom: 0 }}>
                    <button className="fin-pill-tab act">All (4)</button>
                    <button className="fin-pill-tab">Flagged (1)</button>
                  </div>
                </div>

                <div className="fin-alert fin-alert-amber">
                  <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /></svg>
                  <span><strong>1 event is flagged as over budget.</strong> Review carefully before approving.</span>
                </div>

                <div className="fin-rev-card flagged">
                  <div className="fin-rev-card-header">
                    <div>
                      <div className="fin-rev-card-title">Cultural Night 2026</div>
                      <div className="fin-rev-card-id">EVT-2026-008 · Faculty of Arts & Humanities</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span className="fin-badge fin-b-over"><span className="fin-bdot"></span>Over Budget</span>
                      <span className="fin-badge fin-b-rev"><span className="fin-bdot"></span>Pending</span>
                    </div>
                  </div>
                  <div className="fin-rev-amounts">
                    <div className="fin-rev-amt"><div className="fin-rev-amt-val">LKR 100,000</div><div className="fin-rev-amt-label">Allocated</div></div>
                    <div className="fin-rev-amt over"><div class="fin-rev-amt-val">LKR 108,000</div><div className="fin-rev-amt-label">Requested</div></div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label className="fin-form-label">Finance Notes</label>
                    <textarea className="fin-form-control" placeholder="Add your notes…"></textarea>
                  </div>
                  <div className="fin-rev-actions">
                    <button className="fin-btn fin-btn-em fin-btn-sm" onClick={() => openApproveModal('Cultural Night 2026')}>Approve with Condition</button>
                    <button className="fin-btn fin-btn-danger fin-btn-sm">Reject</button>
                  </div>
                </div>
              </div>

              {/* ALLOCATE BUDGET */}
              <div className={`fin-dview ${activeView === 'dv-allocate' ? 'act' : ''}`}>
                <div className="fin-dview-header">
                  <div>
                    <div className="fin-eyebrow"><span className="fin-eyebrow-dot"></span>Allocation</div>
                    <div className="fin-dview-title">Allocate Event Budget</div>
                  </div>
                </div>
                <div className="fin-card">
                  <h3 className="fin-section-title">Select Event</h3>
                  <div className="fin-form-group">
                    <label className="fin-form-label">Approved Event *</label>
                    <select className="fin-form-control" onChange={e => updateAllocInfo(e.target.value)}>
                      <option value="">Select an approved event…</option>
                      <option value="tiw">Tech Innovation Workshop (EVT-2026-001)</option>
                    </select>
                  </div>
                  {allocInfo && (
                    <div className="fin-budget-row">
                      <div className="fin-bsum"><div className="fin-bsum-label">Request</div><div className="fin-bsum-val">LKR 75,000</div></div>
                      <div className="fin-bsum"><div className="fin-bsum-label">Remaining Pool</div><div className="fin-bsum-val">LKR 95,000</div></div>
                    </div>
                  )}
                </div>
                <div className="fin-card">
                  <div className="fin-btn-row"><button className="fin-btn fin-btn-prim">Confirm Allocation</button></div>
                </div>
              </div>

              {/* OTHER TABS */}
              <div className={`fin-dview ${activeView === 'dv-expenses' ? 'act' : ''}`}>
                <div className="fin-dview-title">Expense Tracker</div>
                <div className="fin-card" style={{ padding: '20px' }}>Tracking expenses feature coming soon!</div>
              </div>
              <div className={`fin-dview ${activeView === 'dv-reports' ? 'act' : ''}`}>
                <div className="fin-dview-title">Final Reports</div>
                <div className="fin-card" style={{ padding: '20px' }}>Reports feature coming soon!</div>
              </div>
              <div className={`fin-dview ${activeView === 'dv-history' ? 'act' : ''}`}>
                <div className="fin-dview-title">Transaction History</div>
                <div className="fin-card" style={{ padding: '20px' }}>History feature coming soon!</div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="fin-site-footer">
        <div className="fin-footer-bottom">
          <div className="fin-wrap">
            <div className="fin-footer-bottom-inner" style={{ textAlign: 'center' }}>
              <div className="fin-footer-copy">© 2026 <strong>EventSync</strong> · University Event Management System</div>
            </div>
          </div>
        </div>
      </footer>

      {/* MODAL */}
      <div className={`fin-modal-overlay ${modalOpen ? 'open' : ''}`} onClick={(e) => { if (e.target.classList.contains('fin-modal-overlay')) setModalOpen(false) }}>
        <div className="fin-modal" style={{ position: 'relative' }}>
          <div className="fin-modal-close" onClick={() => setModalOpen(false)}>✕</div>
          <h3 className="fin-modal-title">Confirm Budget Approval</h3>
          <p className="fin-modal-sub">You are about to approve the budget for <strong>{modalEventName}</strong>.</p>
          <div className="fin-form-group">
            <label className="fin-form-label">Confirmed Allocation (LKR)</label>
            <input type="number" className="fin-form-control" placeholder="Amount" />
          </div>
          <div className="fin-btn-row" style={{ marginTop: '20px' }}>
            <button className="fin-btn fin-btn-sec" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="fin-btn fin-btn-prim" onClick={() => setModalOpen(false)}>Approve & Notify</button>
          </div>
        </div>
      </div>
    </div>
  );
}
