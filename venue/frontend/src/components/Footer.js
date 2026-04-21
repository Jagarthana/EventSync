import React from 'react';
import { Link } from 'react-router-dom';

import { getCampusConfig } from '../config/tenant';

export function Footer() {
  const { campusName } = getCampusConfig();

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="wrap">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">

                <span className="footer-brand-name">
                  Event<em>Sync</em>
                </span>
              </div>
              <p className="footer-desc">
                A centralized platform for managing events efficiently — from proposal to final report.
                Tailored for {campusName}.
              </p>
              <div className="footer-contact">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#f9a8c4" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                events@university.edu
              </div>
              <div className="footer-contact">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#f9a8c4" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {campusName}, Main Block, Room 201
              </div>
              <div className="footer-social">
                <span className="fsoc" aria-hidden>f</span>
                <span className="fsoc" aria-hidden>𝕏</span>
                <span className="fsoc" aria-hidden>in</span>
                <span className="fsoc" aria-hidden>ig</span>
              </div>
              <div className="footer-status">
                <span className="status-dot" /> System status: All systems operational
              </div>
            </div>
            <div>
              <div className="footer-col-title">Platform</div>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/dashboard">Event Gallery</Link></li>
                <li><Link to="/dashboard">Submit Proposal</Link></li>
                <li><Link to="/dashboard">Track Approval</Link></li>
                <li><Link to="/dashboard">Budget Management</Link></li>
                <li><Link to="/dashboard">Final Reports</Link></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Resources</div>
              <ul className="footer-links">
                <li><Link to="/help">User Guide</Link></li>
                <li><Link to="/dashboard">Proposal Templates</Link></li>
                <li><Link to="/dashboard">Risk Assessment Form</Link></li>
                <li><Link to="/help">FAQ</Link></li>
                <li><Link to="/help">Contact Support</Link></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Campus</div>
              <ul className="footer-links">
                <li><Link to="/about">SLIIT Website</Link></li>
                <li><Link to="/about">Student Affairs</Link></li>
                <li><Link to="/help">Privacy Policy</Link></li>
                <li><Link to="/help">Terms of Use</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="wrap">
          <div className="footer-bottom-inner">
            <div className="footer-copy">
              © 2026 <strong>EventSync</strong> · {campusName} Event Management System · All rights reserved.
            </div>
            <div className="footer-bl">
              <Link to="/help">Privacy Policy</Link>
              <Link to="/help">Terms of Use</Link>
              <Link to="/help">Accessibility</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
