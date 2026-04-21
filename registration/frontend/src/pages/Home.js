import React from 'react';
import { Link } from 'react-router-dom';
import { getCampusConfig } from '../config/tenant';

const FEATURES = [
  {
    title: 'Proposal Management',
    desc: 'Create, edit, and submit event proposals with all required information digitally.',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    title: 'Approval Workflow',
    desc: 'Transparent review with real-time status tracking at every stage.',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    title: 'Budget Tracking',
    desc: 'Manage budgets, expense breakdowns, and financial summaries post-approval.',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    title: 'Final Reporting',
    desc: 'Submit post-event reports with attendance data, photos, and outcomes.',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

const GALLERY = [
  {
    title: 'SLIIT Robofest 2025',
    tag: 'Competition',
    date: 'March 2025',
    participants: '500+ participants',
    img: 'https://www.sliit.lk/wp-content/uploads/2025/03/Robofest-2025-1.jpg',
    fallback: 'https://picsum.photos/seed/robofest25/480/200',
  },
  {
    title: "SLIIT's Got Talent 2024",
    tag: 'Cultural',
    date: 'August 2024',
    participants: '1200+ participants',
    img: 'https://www.sliit.lk/wp-content/uploads/2024/08/SGT-2024.jpg',
    fallback: 'https://picsum.photos/seed/sgt24/480/200',
  },
  {
    title: 'SLIIT Walk 2024',
    tag: 'Charity',
    date: 'September 2024',
    participants: '5000+ participants',
    img: 'https://www.sliit.lk/wp-content/uploads/2024/09/SLIIT-Walk-2024.jpg',
    fallback: 'https://picsum.photos/seed/walk24/480/200',
  },
  {
    title: 'SLIIT CodeFest 2025',
    tag: 'Hackathon',
    date: 'October 2025',
    participants: '800+ participants',
    img: 'https://www.sliit.lk/wp-content/uploads/2025/10/Codefest-2025.jpg',
    fallback: 'https://picsum.photos/seed/codefest25/480/200',
  },
  {
    title: 'SLIIT Career Day 2025',
    tag: 'Academic',
    date: 'November 2025',
    participants: '2000+ attendees',
    img: 'https://www.sliit.lk/wp-content/uploads/2025/11/Career-Day-2025.jpg',
    fallback: 'https://picsum.photos/seed/careerday25/480/200',
  },
  {
    title: 'SLIIT Convocation 2026',
    tag: 'Ceremony',
    date: 'March 2026',
    participants: '700+ graduates',
    img: 'https://www.sliit.lk/wp-content/uploads/2026/03/Convocation-2026.jpg',
    fallback: 'https://picsum.photos/seed/conv26/480/200',
  },
];

function GalleryImage({ src, fallback, alt }) {
  return (
    <img
      className="gallery-img"
      src={src}
      alt={alt}
      onError={(e) => { e.target.onerror = null; e.target.src = fallback; }}
      style={{ width: '100%', height: '180px', objectFit: 'cover' }}
    />
  );
}

export function Home() {
  const { campusName } = getCampusConfig();

  return (
    <div className="page">
      <div className="main-pad-lg">
        <div className="wrap">
          <div className="hero">
            <div>
              <div className="hero-kicker">
                <span className="hero-kicker-dot" /> Event Platform · {campusName}
              </div>
              <h1 className="hero-h1">
                Sync Your
                <br />
                <em>SLIIT Events</em>
                <br />
                In One Place
              </h1>
              <p className="hero-desc">
                EventSync is a centralized platform for students and officials to propose, approve,
                budget, and document events at {campusName} — seamlessly from start to finish.
              </p>
              <div className="hero-actions">
                <Link to="/login" className="btn btn-prim btn-lg">
                  Get Started
                </Link>
                <Link to="/register" className="btn btn-sec btn-lg">
                  Create Account
                </Link>
              </div>
            </div>
            <div className="hero-panel">
              <div className="hstat-main">
                <div>
                  <div className="hstat-num">94%</div>
                  <div className="hstat-label">Average approval rate</div>
                </div>
                <div className="hstat-icon">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#f9a8c4" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
              </div>
              <div className="hstat-grid">
                <div className="hstat-sm">
                  <div className="hss-num">3.2k</div>
                  <div className="hss-label">Participants</div>
                </div>
                <div className="hstat-sm">
                  <div className="hss-num">12</div>
                  <div className="hss-label">Departments</div>
                </div>
                <div className="hstat-sm">
                  <div className="hss-num">48h</div>
                  <div className="hss-label">Avg. approval</div>
                </div>
                <div className="hstat-sm">
                  <div className="hss-num">100%</div>
                  <div className="hss-label">Digital</div>
                </div>
              </div>
            </div>
          </div>

          <div className="feature-strip">
            {FEATURES.map((f) => (
              <div key={f.title} className="feat-card">
                <div className="feat-icon" style={{ color: 'var(--rose)' }}>{f.icon}</div>
                <div className="feat-title">{f.title}</div>
                <div className="feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: 0 }}>
            <div className="gallery-header">
              <h3 className="section-title" style={{ marginBottom: 0 }}>Recent Events at {campusName}</h3>
              <Link to="/events" className="btn btn-ghost btn-sm">View All →</Link>
            </div>
            <div className="gallery-grid">
              {GALLERY.map((e) => (
                <div key={e.title} className="gallery-card">
                  <div className="gallery-img-wrap">
                    <img className="gallery-img" src={e.img} alt={e.title} onError={(ev) => { ev.target.onerror = null; ev.target.src = e.fallback; }} />
                    <span className="gallery-tag">{e.tag}</span>
                  </div>
                  <div className="gallery-body">
                    <div className="gallery-title">{e.title}</div>
                    <div className="gallery-meta">
                      {e.date}
                      <span className="gallery-meta-dot" />
                      {e.participants}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
