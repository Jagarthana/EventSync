import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { getCampusConfig } from '../config/tenant';

const NAV_ITEMS = [
  { id: 'dv-overview', label: 'Overview', icon: 'grid' },
  { id: 'dv-proposals', label: 'My Proposals', icon: 'doc', badge: 6 },
  { id: 'dv-create', label: 'New Proposal', icon: 'plus' },
  { id: 'dv-documents', label: 'Documents', icon: 'clip' },
  { id: 'dv-budget', label: 'Budget', icon: 'dollar' },
  { id: 'dv-resources', label: 'Resources', icon: 'box' },
  { id: 'dv-report', label: 'Final Report', icon: 'chart' },
];

const SAMPLE_PROPOSALS = [
  { id: 'EVT-2026-001', title: 'SLIIT Career Day 2026', date: 'Apr 10, 2026', status: 'approved' },
  { id: 'EVT-2026-002', title: 'Pongal Thiruvizha at SLIIT', date: 'May 2, 2026', status: 'review' },
  { id: 'EVT-2026-003', title: 'ICSDB 2025', date: 'Jun 15, 2026', status: 'draft' },
];

const STATUS_MAP = { draft: 'b-draft', sub: 'b-sub', review: 'b-rev', approved: 'b-app', rejected: 'b-rej', returned: 'b-ret', done: 'b-done' };
const STATUS_LABEL = { draft: 'Draft', sub: 'Submitted', review: 'Under Review', approved: 'Approved', rejected: 'Rejected', returned: 'Returned', done: 'Completed' };

function SidebarNav({ activeView, setActiveView, onLogout }) {
  return (
    <nav className="sidebar-nav">
      <div className="snav-section">Main</div>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`snav-item ${activeView === item.id ? 'act' : ''}`}
          onClick={() => setActiveView(item.id)}
        >
          {item.icon === 'grid' && <GridIcon />}
          {item.icon === 'doc' && <DocIcon />}
          {item.icon === 'plus' && <PlusIcon />}
          {item.icon === 'clip' && <ClipIcon />}
          {item.icon === 'dollar' && <DollarIcon />}
          {item.icon === 'box' && <BoxIcon />}
          {item.icon === 'chart' && <ChartIcon />}
          {item.label}
          {item.badge != null && <span className="snav-badge">{item.badge}</span>}
        </button>
      ))}
      <div className="snav-divider" />
      <button type="button" className="snav-logout" onClick={onLogout}>
        <LogoutIcon /> Log Out
      </button>
    </nav>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}
function ClipIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  );
}
function DollarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dv-overview');
  const [createStep, setCreateStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [selectedProposal, setSelectedProposal] = useState(null);
  const { currencyCode } = getCampusConfig();
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: '', type: '', club: '', objectives: '', description: '',
    date: '', duration: '', startTime: '', endTime: '', participants: '',
    venue: '', requirements: '', documents: [], expenses: [], resourcesChecked: []
  });

  useEffect(() => {
    if (isAuthenticated) { fetchEvents(); }
  }, [isAuthenticated]);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/api/events');
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const validateStep1 = () => {
    const errs = {};
    if (!formData.title) errs.title = 'Event Title is required';
    if (!formData.type) errs.type = 'Event Type is required';
    if (!formData.objectives) errs.objectives = 'Objectives are required';
    if (!formData.description) errs.description = 'Description is required';
    if (!formData.date) {
      errs.date = 'Date is required';
    } else {
      const selected = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected <= today) errs.date = 'Date must be an upcoming date';
    }
    if (!formData.startTime) errs.startTime = 'Start Time is required';
    if (!formData.endTime) errs.endTime = 'End Time is required';
    if (!formData.participants) {
      errs.participants = 'Expected participants is required';
    } else if (isNaN(formData.participants) || parseInt(formData.participants) <= 0) {
      errs.participants = 'Participants must be a positive number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (createStep === 1 && !validateStep1()) return;
    setCreateStep((prev) => prev + 1);
    window.scrollTo(0, 0);
  };
  const prevStep = () => {
    setCreateStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleFileUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return alert("File exceeds 10MB limit.");

    const docData = new FormData();
    docData.append('doc', file);

    try {
      const res = await axios.post('/api/upload', docData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const newDoc = { name: file.name, type: docType, url: res.data };
      setFormData(prev => ({ ...prev, documents: [...prev.documents, newDoc] }));
    } catch (err) {
      alert('Upload failed');
    }
  };

  const removeDocument = (index) => setFormData(prev => ({ ...prev, documents: prev.documents.filter((_, i) => i !== index) }));

  const addExpense = () => setFormData(p => ({ ...p, expenses: [...p.expenses, { category: 'Materials', description: '', amount: 0 }] }));
  const updateExpense = (idx, field, val) => {
    const exps = [...formData.expenses];
    exps[idx][field] = val;
    setFormData(p => ({ ...p, expenses: exps }));
  };
  const removeExpense = (idx) => setFormData(p => ({ ...p, expenses: p.expenses.filter((_, i) => i !== idx) }));

  const handleResourceToggle = (e, resName) => {
    const checked = e.target.checked;
    let up = [...(formData.resourcesChecked || [])];
    if (checked) up.push(resName); else up = up.filter(r => r !== resName);
    setFormData(p => ({ ...p, resourcesChecked: up }));
  };

  const submitProposal = async () => {
    try {
      const payload = {
        title: formData.title, type: formData.type, club: formData.club,
        objectives: formData.objectives, description: formData.description,
        date: formData.date, duration: formData.duration, startTime: formData.startTime,
        endTime: formData.endTime, participants: formData.participants,
        venue: formData.venue, requirements: formData.requirements,
        expenses: formData.expenses,
        documents: formData.documents,
        resources: formData.resourcesChecked,
        totalEstimated: formData.expenses.reduce((s, e) => s + Number(e.amount), 0),
        status: 'sub'
      };
      await axios.post('/api/events', payload);
      fetchEvents();
      setFormData({
        title: '', type: '', club: '', objectives: '', description: '',
        date: '', duration: '', startTime: '', endTime: '', participants: '',
        venue: '', requirements: '', documents: [], expenses: [], resourcesChecked: []
      });
      setCreateStep(1);
      setActiveView('dv-proposals');
    } catch (err) {
      console.error(err);
      alert("Failed to submit event: " + (err.response?.data?.message || err.message));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const viewDetails = (proposal) => {
    setSelectedProposal(proposal);
    setActiveView('dv-proposal-detail');
  };

  const editDraft = (proposal) => {
    setFormData({
      ...proposal,
      date: proposal.date ? proposal.date.substring(0, 10) : ''
    });
    setCreateStep(1);
    setActiveView('dv-create');
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="page">
      <div className="main-pad">
        <div className="wrap">
          <div className="dash-layout">
            <aside className="sidebar">
              <div className="sidebar-card">
                <div className="sidebar-user">
                  <div className="su-avatar">{initials}</div>
                  <div className="su-name">{user?.name || 'User'}</div>
                  <div className="su-role">{user?.role || 'Organizer'}</div>
                  <div className="su-badge">
                    <span className="su-badge-dot" /> {user?.role || 'Organizer'}
                  </div>
                </div>
                <SidebarNav activeView={activeView} setActiveView={setActiveView} onLogout={handleLogout} />
              </div>
            </aside>

            <div className="dcontent">
              {/* Overview */}
              <div id="dv-overview" className={`dview ${activeView === 'dv-overview' ? 'act' : ''}`}>
                <div className="dview-header">
                  <div>
                    <div className="eyebrow"><span className="eyebrow-dot" /> Dashboard</div>
                    <div className="dview-title">Good morning, {user?.name?.split(' ')[0] || 'User'} 👋</div>
                    <div className="dview-sub">Here's your event overview</div>
                  </div>
                  <button type="button" className="btn btn-prim" onClick={() => setActiveView('dv-create')}>
                    New Proposal
                  </button>
                </div>
                <div className="stats-4">
                  <div className="stat-card dark">
                    <div className="stat-label">Total Proposals</div>
                    <div className="stat-val">6</div>
                    <div className="stat-change">This academic year</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Approved</div>
                    <div className="stat-val">3</div>
                    <div className="stat-change">Ready to execute</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Under Review</div>
                    <div className="stat-val">2</div>
                    <div className="stat-change">Awaiting decision</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Completed</div>
                    <div className="stat-val">1</div>
                    <div className="stat-change">Report submitted</div>
                  </div>
                </div>
                <div className="qa-grid">
                  <div className="qa-card" onClick={() => setActiveView('dv-create')}>
                    <div className="qa-icon-wrap"><PlusIcon /></div>
                    <div>
                      <div className="qa-card-title">Create New Proposal</div>
                      <div className="qa-card-desc">Submit a new event proposal for review</div>
                    </div>
                  </div>
                  <div className="qa-card" onClick={() => setActiveView('dv-proposals')}>
                    <div className="qa-icon-wrap"><DocIcon /></div>
                    <div>
                      <div className="qa-card-title">View My Proposals</div>
                      <div className="qa-card-desc">Track status of all submitted proposals</div>
                    </div>
                  </div>
                  <div className="qa-card" onClick={() => setActiveView('dv-documents')}>
                    <div className="qa-icon-wrap"><ClipIcon /></div>
                    <div>
                      <div className="qa-card-title">Upload Documents</div>
                      <div className="qa-card-desc">Attach agenda, letters & risk documents</div>
                    </div>
                  </div>
                  <div className="qa-card" onClick={() => setActiveView('dv-budget')}>
                    <div className="qa-icon-wrap"><DollarIcon /></div>
                    <div>
                      <div className="qa-card-title">Update Budget</div>
                      <div className="qa-card-desc">Add expense details for approved events</div>
                    </div>
                  </div>
                </div>
                <div className="card card-flush">
                  <div className="card-header">
                    <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '.95rem' }}>Recent Proposals</span>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setActiveView('dv-proposals')}>View All →</button>
                  </div>
                  <div className="tbl-wrap">
                    <table>
                      <thead>
                        <tr><th>Event</th><th>Date</th><th>Status</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {events.slice(0, 5).map((p) => (
                          <tr key={p._id}>
                            <td><div className="cell-name">{p.title}</div><div className="cell-sub">{p._id.slice(-6).toUpperCase()}</div></td>
                            <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                            <td><span className={`badge ${STATUS_MAP[p.status]}`}><span className="bdot" />{STATUS_LABEL[p.status]}</span></td>
                            <td>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button type="button" className="btn btn-sec btn-sm" onClick={() => viewDetails(p)}>View</button>
                                {(p.status === 'approved' || p.status === 'draft') && (
                                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setActiveView(p.status === 'draft' ? 'dv-create' : 'dv-documents')}>
                                    {p.status === 'draft' ? 'Edit' : 'Docs'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="card">
                  <h3 className="section-title">Recent Activity</h3>
                  <ul className="activity-list">
                    <li className="activity-item"><div className="act-dot rose" /><div><div className="act-text"><strong>SLIIT Career Day 2026</strong> was approved by the Faculty Advisor.</div><div className="act-time">2 hours ago</div></div></li>
                    <li className="activity-item"><div className="act-dot tl" /><div><div className="act-text">You submitted <strong>Pongal Thiruvizha at SLIIT</strong> for review.</div><div className="act-time">Yesterday, 4:12 PM</div></div></li>
                    <li className="activity-item"><div className="act-dot am" /><div><div className="act-text">Budget updated for <strong>SLIIT Career Day 2026</strong> — {currencyCode} 62,500 estimated.</div><div className="act-time">Mar 3, 2026</div></div></li>
                    <li className="activity-item"><div className="act-dot rd" /><div><div className="act-text"><strong>Cultural Night 2026</strong> was rejected. Reason: Venue conflict.</div><div className="act-time">Feb 15, 2026</div></div></li>
                  </ul>
                </div>
              </div>

              {/* My Proposals */}
              <div id="dv-proposals" className={`dview ${activeView === 'dv-proposals' ? 'act' : ''}`}>
                <div className="dview-header">
                  <div>
                    <div className="eyebrow"><span className="eyebrow-dot" /> Proposals</div>
                    <div className="dview-title">My Event Proposals</div>
                    <div className="dview-sub">All proposals submitted under your account</div>
                  </div>
                  <button type="button" className="btn btn-prim" onClick={() => setActiveView('dv-create')}>+ New Proposal</button>
                </div>
                <div className="card card-flush">
                  <div className="card-header">
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
                      <input type="text" className="form-control" placeholder="Search proposals…" style={{ maxWidth: 230, margin: 0 }} />
                      <select className="form-control" style={{ maxWidth: 160, margin: 0 }}><option>All Statuses</option><option>Draft</option><option>Submitted</option><option>Under Review</option><option>Approved</option><option>Rejected</option></select>
                      <select className="form-control" style={{ maxWidth: 150, margin: 0 }}><option>All Types</option><option>Workshop</option><option>Seminar</option><option>Conference</option></select>
                    </div>
                  </div>
                  <div className="tbl-wrap">
                    <table>
                      <thead>
                        <tr><th>Event Name</th><th>Type</th><th>Submitted</th><th>Event Date</th><th>Status</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {events.map((p) => (
                          <tr key={p._id}>
                            <td><div className="cell-name">{p.title}</div><div className="cell-sub">{p._id.slice(-6).toUpperCase()}</div></td>
                            <td style={{ fontSize: '.8rem', color: 'var(--text-3)' }}>{p.type}</td>
                            <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                            <td>{p.date ? new Date(p.date).toLocaleDateString() : 'TBD'}</td>
                            <td><span className={`badge ${STATUS_MAP[p.status]}`}><span className="bdot" />{STATUS_LABEL[p.status]}</span></td>
                            <td>
                              <div style={{ display: 'flex', gap: 5 }}>
                                <button type="button" className="btn btn-sec btn-sm" onClick={() => viewDetails(p)}>View</button>
                                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setActiveView('dv-documents')}>Docs</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Create Proposal */}
              <div id="dv-create" className={`dview ${activeView === 'dv-create' ? 'act' : ''}`}>
                <div className="dview-header">
                  <div>
                    <div className="eyebrow"><span className="eyebrow-dot" /> New Proposal</div>
                    <div className="dview-title">Create Event Proposal</div>
                    <div className="dview-sub">Step {createStep} of 5 — Fill in required details</div>
                  </div>
                </div>
                <div className="card" style={{ padding: '20px 24px 14px' }}>
                  <div className="stepper">
                    <div className={`step ${createStep > 1 ? 'done' : createStep === 1 ? 'curr' : ''}`}><div className="step-circle">{createStep > 1 ? '✓' : '1'}</div>Basic Info</div>
                    <div className={`step ${createStep > 2 ? 'done' : createStep === 2 ? 'curr' : ''}`}><div className="step-circle">{createStep > 2 ? '✓' : '2'}</div>Documents</div>
                    <div className={`step ${createStep > 3 ? 'done' : createStep === 3 ? 'curr' : ''}`}><div className="step-circle">{createStep > 3 ? '✓' : '3'}</div>Budget</div>
                    <div className={`step ${createStep > 4 ? 'done' : createStep === 4 ? 'curr' : ''}`}><div className="step-circle">{createStep > 4 ? '✓' : '4'}</div>Resources</div>
                    <div className={`step ${createStep === 5 ? 'curr' : ''}`}><div className="step-circle">5</div>Review</div>
                  </div>
                </div>

                {createStep === 1 && (
                  <>
                    <div className="card">
                      <h3 className="section-title">Basic Information</h3>
                      <div className="form-group">
                        <label className="form-label">Event Title <span className="req">*</span></label>
                        <input type="text" className="form-control" style={errors.title ? { borderColor: 'var(--red)' } : {}} placeholder="e.g. Annual SLIIT Career Day 2026" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                        {errors.title && <div style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4 }}>{errors.title}</div>}
                        <div className="form-hint">A clear, descriptive title that represents the event.</div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Event Type <span className="req">*</span></label>
                          <select className="form-control" style={errors.type ? { borderColor: 'var(--red)' } : {}} value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                            <option value="">Select event type</option>
                            <option>Workshop</option><option>Seminar</option><option>Conference</option>
                            <option>Cultural Program</option><option>Sports Event</option><option>Club Activity</option><option>Other</option>
                          </select>
                          {errors.type && <div style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4 }}>{errors.type}</div>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Organizing Club / Department</label>
                          <input type="text" className="form-control" placeholder="e.g. IEEE Student Chapter" value={formData.club} onChange={(e) => setFormData({ ...formData, club: e.target.value })} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Event Objectives <span className="req">*</span></label>
                        <textarea className="form-control" style={errors.objectives ? { borderColor: 'var(--red)' } : {}} placeholder="Describe the main goals and objectives…" value={formData.objectives} onChange={(e) => setFormData({ ...formData, objectives: e.target.value })} />
                        {errors.objectives && <div style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4 }}>{errors.objectives}</div>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Event Description <span className="req">*</span></label>
                        <textarea className="form-control" style={{ minHeight: 110, ...(errors.description ? { borderColor: 'var(--red)' } : {}) }} placeholder="Activities planned, agenda overview, target audience…" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                        {errors.description && <div style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4 }}>{errors.description}</div>}
                      </div>
                    </div>
                    <div className="card">
                      <h3 className="section-title">Schedule & Logistics</h3>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Proposed Date <span className="req">*</span></label>
                          <input type="date" className="form-control" style={errors.date ? { borderColor: 'var(--red)' } : {}} value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                          {errors.date && <div style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4 }}>{errors.date}</div>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Duration</label>
                          <select className="form-control" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })}>
                            <option value="">Select duration</option>
                            <option>Half day (&lt; 4 hours)</option><option>Full day</option><option>Multi-day</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Start Time <span className="req">*</span></label>
                          <input type="time" className="form-control" style={errors.startTime ? { borderColor: 'var(--red)' } : {}} value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
                          {errors.startTime && <div style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4 }}>{errors.startTime}</div>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">End Time <span className="req">*</span></label>
                          <input type="time" className="form-control" style={errors.endTime ? { borderColor: 'var(--red)' } : {}} value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
                          {errors.endTime && <div style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4 }}>{errors.endTime}</div>}
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Expected Participants <span className="req">*</span></label>
                          <input type="number" className="form-control" style={errors.participants ? { borderColor: 'var(--red)' } : {}} placeholder="e.g. 150" value={formData.participants} onChange={(e) => setFormData({ ...formData, participants: e.target.value })} />
                          {errors.participants && <div style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 4 }}>{errors.participants}</div>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Preferred Venue</label>
                          <select className="form-control" value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })}>
                            <option value="">No preference</option><option>Main Auditorium</option><option>Lecture Hall A</option><option>Conference Room 1</option><option>Open Grounds</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Special Requirements</label>
                        <textarea className="form-control" placeholder="AV equipment, catering, accessibility needs…" value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} />
                      </div>
                    </div>
                    <div className="card">
                      <div className="btn-row" style={{ justifyContent: 'space-between' }}>
                        <button type="button" className="btn btn-ghost" onClick={() => setActiveView('dv-proposals')}>Cancel</button>
                        <button type="button" className="btn btn-prim" onClick={nextStep}>Next: Documents →</button>
                      </div>
                    </div>
                  </>
                )}

                {createStep === 2 && (
                  <>
                    <div className="card" style={{ background: 'var(--rose-lt)', border: '1px solid var(--rose-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div>
                          <h3 className="section-title" style={{ marginBottom: 5 }}>AI Smart Analysis</h3>
                          <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', margin: 0 }}>Get feasibility scores, suggestions, and risk warnings for your proposal.</p>
                        </div>
                        <div className="badge b-rev" style={{ padding: '6px 12px', background: 'var(--surface)' }}><span className="bdot" />Coming Soon</div>
                      </div>
                    </div>
                    <div className="card">
                      <h3 className="section-title">Required Documents</h3>
                      {formData.documents.map((doc, idx) => (
                        <div key={idx} className="doc-item" style={{display: 'flex', justifyContent: 'space-between', padding: '10px', border: '1px solid var(--border)', marginBottom: '8px', borderRadius: '8px'}}>
                          <div><strong>{doc.type}</strong>: {doc.name}</div>
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => removeDocument(idx)}>Remove</button>
                        </div>
                      ))}
                      
                      <div className="form-group" style={{marginTop: 16}}>
                        <label className="form-label">Event Agenda <span className="req">*</span></label>
                        <div className="file-zone"><input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, 'Event Agenda')} /><div className="file-zone-icon">📄</div><div className="file-zone-text"><strong>Click to upload</strong> or drag & drop</div><div className="file-zone-sub">PDF, DOC, DOCX — max 10MB</div></div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Invitation / Request Letter <span className="req">*</span></label>
                        <div className="file-zone"><input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, 'Request Letter')} /><div className="file-zone-icon">✉️</div><div className="file-zone-text"><strong>Click to upload</strong> or drag & drop</div><div className="file-zone-sub">PDF, DOC, DOCX — max 10MB</div></div>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Risk Assessment Form <span className="req">*</span></label>
                        <div className="file-zone"><input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, 'Risk Assessment')} /><div className="file-zone-icon">⚠️</div><div className="file-zone-text"><strong>Click to upload</strong> or drag & drop</div><div className="file-zone-sub">PDF, DOC, DOCX — max 10MB</div></div>
                      </div>
                    </div>
                    <div className="card">
                      <div className="btn-row" style={{ justifyContent: 'space-between' }}>
                        <button type="button" className="btn btn-sec" onClick={prevStep}>← Back</button>
                        <button type="button" className="btn btn-prim" onClick={nextStep}>Next: Budget →</button>
                      </div>
                    </div>
                  </>
                )}

                {createStep === 3 && (
                  <>
                    <div className="card card-flush">
                      <div className="card-header"><span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '.95rem' }}>Expense Breakdown</span><button type="button" className="btn btn-ghost btn-sm" onClick={addExpense}>+ Add Expense</button></div>
                      <div className="tbl-wrap exp-tbl">
                        <table>
                          <thead><tr><th>Category</th><th>Description</th><th>Est. Amount ({currencyCode})</th><th></th></tr></thead>
                          <tbody>
                            {formData.expenses.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center', padding: 20}}>No expenses added yet.</td></tr>}
                            {formData.expenses.map((exp, idx) => (
                              <tr key={idx}>
                                <td>
                                  <select className="form-control" value={exp.category} onChange={(e) => updateExpense(idx, 'category', e.target.value)}>
                                    <option>Venue</option><option>Catering</option><option>Materials</option><option>Equipment</option><option>Other</option>
                                  </select>
                                </td>
                                <td><input type="text" className="form-control" placeholder="Description" value={exp.description} onChange={(e) => updateExpense(idx, 'description', e.target.value)} /></td>
                                <td><input type="number" className="form-control" placeholder="0" value={exp.amount} onChange={(e) => updateExpense(idx, 'amount', e.target.value)} /></td>
                                <td><button type="button" className="btn btn-danger btn-sm" onClick={() => removeExpense(idx)}>✕</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="card">
                      <div className="form-group"><label className="form-label">Budget Notes</label><textarea className="form-control" placeholder="Explain significant costs or special circumstances…" /></div>
                      <div className="btn-row" style={{ justifyContent: 'space-between' }}>
                        <button type="button" className="btn btn-sec" onClick={prevStep}>← Back</button>
                        <button type="button" className="btn btn-prim" onClick={nextStep}>Next: Resources →</button>
                      </div>
                    </div>
                  </>
                )}

                {createStep === 4 && (
                  <>
                    <div className="card card-flush" style={{ marginBottom: 18 }}>
                      <div className="card-header"><span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '.95rem' }}>Resource Checklist</span></div>
                      <div style={{ padding: 20 }}>
                        <div className="form-row">
                          {['Projector & Screen', 'Sound System (Mics, Speakers)', 'Security Personnel', 'Extra Seating arranged'].map(resName => (
                            <div key={resName} className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <input type="checkbox" id={`res-${resName}`} style={{ width: 18, height: 18 }} checked={formData.resourcesChecked.includes(resName)} onChange={(e) => handleResourceToggle(e, resName)} />
                              <label htmlFor={`res-${resName}`} style={{ fontWeight: 600, fontSize: '0.9rem' }}>{resName}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="card">
                      <div className="btn-row" style={{ justifyContent: 'space-between' }}>
                        <button type="button" className="btn btn-sec" onClick={prevStep}>← Back</button>
                        <button type="button" className="btn btn-prim" onClick={nextStep}>Next: Review & Submit →</button>
                      </div>
                    </div>
                  </>
                )}

                {createStep === 5 && (
                  <>
                    <div className="card">
                      <h3 className="section-title">Review Proposal Details</h3>
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-3)' }}>Event Title</div>
                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>{formData.title}</div>
                      </div>
                      <div className="form-row" style={{ marginBottom: 16 }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-3)' }}>Event Type</div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{formData.type}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-3)' }}>Date & Time</div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{formData.date} {formData.startTime && `(${formData.startTime} - ${formData.endTime})`}</div>
                        </div>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-3)' }}>Participants</div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{formData.participants} expected</div>
                      </div>
                    </div>
                    <div className="card">
                      <div className="btn-row" style={{ justifyContent: 'space-between' }}>
                        <button type="button" className="btn btn-sec" onClick={prevStep}>← Back</button>
                        <button type="button" className="btn btn-prim" onClick={submitProposal} style={{ width: 200, height: 44, fontSize: '1rem' }}>✓ Submit Proposal</button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Documents */}
              <div id="dv-documents" className={`dview ${activeView === 'dv-documents' ? 'act' : ''}`}>
                <div className="dview-header">
                  <div>
                    <div className="eyebrow"><span className="eyebrow-dot" /> Documents</div>
                    <div className="dview-title">Event Documents</div>
                    <div className="dview-sub">Upload all required supporting documents for your proposal</div>
                  </div>
                </div>
                <div className="alert alert-teal">
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <span>Documents marked <strong>*</strong> are required before your proposal can proceed to approval.</span>
                </div>
                <div className="card">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Attach documents to proposal</label>
                    <select className="form-control">
                      <option>SLIIT Career Day 2026 (EVT-2026-001) — Approved</option>
                      <option>Pongal Thiruvizha at SLIIT (EVT-2026-002) — Under Review</option>
                    </select>
                  </div>
                </div>
                <div className="card">
                  <h3 className="section-title">Required Documents</h3>
                  <div className="form-group">
                    <label className="form-label">Event Agenda <span className="req">*</span></label>
                    <div className="file-zone"><input type="file" accept=".pdf,.doc,.docx" /><div className="file-zone-icon">📄</div><div className="file-zone-text"><strong>Click to upload</strong> or drag & drop</div><div className="file-zone-sub">PDF, DOC, DOCX — max 10MB</div></div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Invitation / Request Letter <span className="req">*</span></label>
                    <div className="file-zone"><input type="file" accept=".pdf,.doc,.docx" /><div className="file-zone-icon">✉️</div><div className="file-zone-text"><strong>Click to upload</strong> or drag & drop</div><div className="file-zone-sub">PDF, DOC, DOCX — max 10MB</div></div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Risk Assessment Form <span className="req">*</span></label>
                    <div className="file-zone"><input type="file" accept=".pdf,.doc,.docx" /><div className="file-zone-icon">⚠️</div><div className="file-zone-text"><strong>Click to upload</strong> or drag & drop</div><div className="file-zone-sub">PDF, DOC, DOCX — max 10MB</div></div>
                  </div>
                </div>
                <div className="card">
                  <h3 className="section-title">Uploaded Files</h3>
                  <div className="doc-item">
                    <div className="doc-left"><div className="doc-icon-wrap">📄</div><div><div className="doc-name">Workshop_Agenda_v2.pdf</div><div className="doc-meta">PDF · 245 KB · Mar 2, 2026 · <span style={{ color: 'var(--em)', fontWeight: 600 }}>Verified</span></div></div></div>
                    <div style={{ display: 'flex', gap: 7 }}><button type="button" className="btn btn-sec btn-sm">View</button><button type="button" className="btn btn-danger btn-sm">Remove</button></div>
                  </div>
                  <div className="doc-item">
                    <div className="doc-left"><div className="doc-icon-wrap">✉️</div><div><div className="doc-name">Invitation_Letter_Dean.pdf</div><div className="doc-meta">PDF · 112 KB · Mar 2, 2026 · <span style={{ color: 'var(--em)', fontWeight: 600 }}>Verified</span></div></div></div>
                    <div style={{ display: 'flex', gap: 7 }}><button type="button" className="btn btn-sec btn-sm">View</button><button type="button" className="btn btn-danger btn-sm">Remove</button></div>
                  </div>
                  <div className="btn-row" style={{ marginTop: 14 }}><button type="button" className="btn btn-prim">Upload Documents</button></div>
                </div>
              </div>

              {/* Budget */}
              <div id="dv-budget" className={`dview ${activeView === 'dv-budget' ? 'act' : ''}`}>
                <div className="dview-header">
                  <div>
                    <div className="eyebrow"><span className="eyebrow-dot" /> Budget</div>
                    <div className="dview-title">Budget Management</div>
                    <div className="dview-sub">Track and update financials for approved events</div>
                  </div>
                </div>
                <div className="alert alert-em">
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  <span>Budget details can only be updated for <strong>approved</strong> proposals.</span>
                </div>
                <div className="card">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Select Approved Event</label>
                    <select className="form-control"><option>SLIIT Career Day 2026 (EVT-2026-001)</option><option>Science Expo 2025 (EVT-2025-012)</option></select>
                  </div>
                </div>
                <div className="budget-row">
                  <div className="bsum"><div className="bsum-label">Allocated Budget</div><div className="bsum-val">{currencyCode} 75,000</div></div>
                  <div className="bsum"><div className="bsum-label">Total Estimated</div><div className="bsum-val">{currencyCode} 62,500</div></div>
                  <div className="bsum hl"><div className="bsum-label">Remaining</div><div className="bsum-val">{currencyCode} 12,500</div></div>
                </div>
                <div className="card card-flush">
                  <div className="card-header"><span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '.95rem' }}>Expense Breakdown</span><button type="button" className="btn btn-ghost btn-sm">+ Add Expense</button></div>
                  <div className="tbl-wrap exp-tbl">
                    <table>
                      <thead><tr><th>Category</th><th>Description</th><th>Est. Amount ({currencyCode})</th><th></th></tr></thead>
                      <tbody>
                        <tr><td><select className="form-control"><option>Venue</option><option>Catering</option><option>Materials</option><option>Equipment</option></select></td><td><input type="text" className="form-control" defaultValue="Auditorium booking fee" /></td><td><input type="number" className="form-control" defaultValue="20000" /></td><td><button type="button" className="btn btn-danger btn-sm">✕</button></td></tr>
                        <tr><td><select className="form-control"><option>Catering</option><option selected>Materials</option></select></td><td><input type="text" className="form-control" defaultValue="Refreshments for participants" /></td><td><input type="number" className="form-control" defaultValue="15000" /></td><td><button type="button" className="btn btn-danger btn-sm">✕</button></td></tr>
                        <tr><td><select className="form-control"><option>Materials</option><option>Equipment</option></select></td><td><input type="text" className="form-control" defaultValue="Printed booklets and handouts" /></td><td><input type="number" className="form-control" defaultValue="12500" /></td><td><button type="button" className="btn btn-danger btn-sm">✕</button></td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="card">
                  <div className="form-group"><label className="form-label">Sponsorships / External Funding</label><input type="number" className="form-control" placeholder={`Enter any sponsorship amount (${currencyCode})`} /></div>
                  <div className="form-group"><label className="form-label">Budget Notes</label><textarea className="form-control" placeholder="Explain significant costs or special circumstances…" /></div>
                  <div className="btn-row"><button type="button" className="btn btn-sec">Save Draft</button><button type="button" className="btn btn-prim">Update Budget</button></div>
                </div>
              </div>

              {/* Resource Requests */}
              <div id="dv-resources" className={`dview ${activeView === 'dv-resources' ? 'act' : ''}`}>
                <div className="dview-header">
                  <div>
                    <div className="eyebrow"><span className="eyebrow-dot" /> Resources</div>
                    <div className="dview-title">Venue & Resource Requests</div>
                    <div className="dview-sub">Book venues and request equipment for your approved events</div>
                  </div>
                </div>
                <div className="alert alert-em">
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  <span>Resources can only be requested for <strong>approved</strong> proposals.</span>
                </div>
                <div className="card">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Select Approved Event</label>
                    <select className="form-control"><option>SLIIT Career Day 2026 (EVT-2026-001)</option></select>
                  </div>
                </div>
                <div className="card">
                  <h3 className="section-title">Venue Selection</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Select Venue <span className="req">*</span></label>
                      <select className="form-control">
                        <option>Main Auditorium</option>
                        <option>Mini Auditorium</option>
                        <option>Lecture Hall 10A</option>
                        <option>Open Grounds</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date & Time</label>
                      <input type="text" className="form-control form-readonly" value="Apr 10, 2026 (08:00 AM - 04:00 PM)" readOnly />
                    </div>
                  </div>
                  <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}>Check Availability</button>
                </div>
                <div className="card card-flush" style={{ marginBottom: 18 }}>
                  <div className="card-header"><span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '.95rem' }}>Resource Checklist</span></div>
                  <div style={{ padding: 20 }}>
                    <div className="form-row">
                      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input type="checkbox" id="res-proj" defaultChecked style={{ width: 18, height: 18 }} />
                        <label htmlFor="res-proj" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Projector & Screen</label>
                      </div>
                      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input type="checkbox" id="res-sound" defaultChecked style={{ width: 18, height: 18 }} />
                        <label htmlFor="res-sound" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Sound System (Mics, Speakers)</label>
                      </div>
                      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input type="checkbox" id="res-sec" style={{ width: 18, height: 18 }} />
                        <label htmlFor="res-sec" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Security Personnel</label>
                      </div>
                      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input type="checkbox" id="res-seat" defaultChecked style={{ width: 18, height: 18 }} />
                        <label htmlFor="res-seat" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Extra Seating arranged</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="form-group">
                    <label className="form-label">Additional Requirements / Notes</label>
                    <textarea className="form-control" placeholder="Specify any specific seating arrangements or additional equipment needed..." />
                  </div>
                  <div className="btn-row">
                    <button type="button" className="btn btn-prim">Submit Resource Request</button>
                  </div>
                </div>
              </div>

              {/* Final Report */}
              <div id="dv-report" className={`dview ${activeView === 'dv-report' ? 'act' : ''}`}>
                <div className="dview-header">
                  <div>
                    <div className="eyebrow"><span className="eyebrow-dot" /> Final Report</div>
                    <div className="dview-title">Submit Final Report</div>
                    <div className="dview-sub">Complete the post-event report within 7 days of completion</div>
                  </div>
                </div>
                <div className="alert alert-amber">
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  <span>Reports must be submitted within <strong>7 days</strong> of event completion.</span>
                </div>
                <div className="card">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Select Completed Event</label>
                    <select className="form-control"><option>Science Expo 2025 (EVT-2025-012) — Dec 18, 2025</option></select>
                  </div>
                </div>
                <div className="card">
                  <h3 className="section-title">Event Summary</h3>
                  <div className="form-group">
                    <label className="form-label">Summary <span className="req">*</span></label>
                    <textarea className="form-control" style={{ minHeight: 130 }} placeholder="Comprehensive summary — key highlights, outcomes…" />
                  </div>
                  <div className="outcome-grid">
                    <div className="form-group"><label className="form-label">Total Participants <span className="req">*</span></label><input type="number" className="form-control" placeholder="e.g. 143" /></div>
                    <div className="form-group"><label className="form-label">Student Participants</label><input type="number" className="form-control" placeholder="e.g. 120" /></div>
                    <div className="form-group"><label className="form-label">Faculty / Staff</label><input type="number" className="form-control" placeholder="e.g. 18" /></div>
                    <div className="form-group"><label className="form-label">External Guests</label><input type="number" className="form-control" placeholder="e.g. 5" /></div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Key Achievements & Outcomes</label><textarea className="form-control" placeholder="Main outcomes, awards, feedback received…" /></div>
                </div>
                <div className="card">
                  <h3 className="section-title">Financial Summary</h3>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Approved Budget ({currencyCode})</label><input type="number" className="form-control form-readonly" defaultValue="75000" readOnly /></div>
                    <div className="form-group"><label className="form-label">Actual Expenditure ({currencyCode}) <span className="req">*</span></label><input type="number" className="form-control" placeholder="e.g. 68000" /></div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Expenditure Notes</label><textarea className="form-control" placeholder="Explain any variances from the approved budget…" /></div>
                </div>
                <div className="card">
                  <h3 className="section-title">Attachments</h3>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Event Photos <span className="req">*</span></label><div className="file-zone"><input type="file" accept="image/*" multiple /><div className="file-zone-icon">🖼️</div><div className="file-zone-text"><strong>Upload event photos</strong></div><div className="file-zone-sub">JPG, PNG — max 5MB each</div></div></div>
                    <div className="form-group"><label className="form-label">Final Report Document <span className="req">*</span></label><div className="file-zone"><input type="file" accept=".pdf,.doc,.docx" /><div className="file-zone-icon">📋</div><div className="file-zone-text"><strong>Upload full report</strong></div><div className="file-zone-sub">PDF, DOC, DOCX — max 20MB</div></div></div>
                  </div>
                </div>
                <div className="card">
                  <div className="form-group"><label className="form-label">Feedback & Recommendations</label><textarea className="form-control" placeholder="What went well? Suggestions for future organizers…" /></div>
                  <div className="btn-row"><button type="button" className="btn btn-sec">Save Draft</button><button type="button" className="btn btn-prim">Submit Final Report</button></div>
                </div>
              </div>

              {/* Proposal Detail View (Timeline) */}
              <div id="dv-proposal-detail" className={`dview ${activeView === 'dv-proposal-detail' ? 'act' : ''}`}>
                <div className="dview-header">
                  <div>
                    <div className="eyebrow"><span className="eyebrow-dot" /> Proposal Details</div>
                    <div className="dview-title">{selectedProposal?.title || 'Event Proposal'}</div>
                    <div className="dview-sub">Track approval progress and timeline</div>
                  </div>
                  <button type="button" className="btn btn-sec" onClick={() => setActiveView('dv-proposals')}>← Back</button>
                </div>

                <div className="card">
                  <h3 className="section-title">Approval Timeline</h3>
                  <div className="timeline">
                    {/* Stage 1: Submitted */}
                    <div className={`tl-item ${selectedProposal ? 'done' : ''}`}>
                      <div className="tl-line" />
                      <div className="tl-marker">1</div>
                      <div className="tl-content">
                        <div className="tl-title">Proposal Submitted</div>
                        <div className="tl-desc">Organizer submitted the event proposal and all required documents.</div>
                      </div>
                    </div>
                    {/* Stage 2: Event Manager */}
                    <div className={`tl-item ${['review', 'approved', 'done'].includes(selectedProposal?.status) ? 'done' : selectedProposal?.status === 'sub' ? 'curr' : ''}`}>
                      <div className="tl-line" />
                      <div className="tl-marker">2</div>
                      <div className="tl-content">
                        <div className="tl-title">Event Manager Review</div>
                        <div className="tl-desc">Pending review of objectives, schedule, and logistical feasibility.</div>
                      </div>
                    </div>
                    {/* Stage 3: Budget Officer */}
                    <div className={`tl-item ${['approved', 'done'].includes(selectedProposal?.status) ? 'done' : selectedProposal?.status === 'review' ? 'curr' : ''}`}>
                      <div className="tl-line" />
                      <div className="tl-marker">3</div>
                      <div className="tl-content">
                        <div className="tl-title">Budget Approval</div>
                        <div className="tl-desc">Financial checking and budget allocation.</div>
                      </div>
                    </div>
                    {/* Stage 4: Venue Allocation / Resource Officer */}
                    <div className={`tl-item ${['approved', 'done'].includes(selectedProposal?.status) ? 'done' : ''}`}>
                      <div className="tl-marker">4</div>
                      <div className="tl-content">
                        <div className="tl-title">Venue & Resource Allocation</div>
                        <div className="tl-desc">Final confirmation of venue booking and equipment requests.</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="section-title">Proposal Summary</h3>
                  <div className="form-row" style={{ marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-3)' }}>Event Type</div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{selectedProposal?.type || 'N/A'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-3)' }}>Date</div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{selectedProposal?.date ? new Date(selectedProposal.date).toLocaleDateString() : 'TBD'}</div>
                    </div>
                  </div>
                  <div className="btn-row" style={{ marginTop: 24 }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setActiveView('dv-documents')}><ClipIcon /> View Documents</button>
                    {(selectedProposal?.status === 'approved' || selectedProposal?.status === 'done') && (
                      <button type="button" className="btn btn-ghost" onClick={() => setActiveView('dv-resources')}><BoxIcon /> Resource Requests</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
