import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Footer.css';

function Footer() {
  const location = useLocation();
  if (location.pathname === '/login') {
    return null;
  }
  return (
    <footer className="es-footer">
      <div className="es-footer__inner">
        <div className="es-footer__brand">
          <div className="es-footer__logo">
            <span className="es-footer__logo-event">Event</span>
            <span className="es-footer__logo-sync">Sync</span>
          </div>
          <p className="es-footer__desc">
            Campus event management for organizers, allocation officers, and facilities — one place to plan, approve, and run events.
          </p>
          <p className="es-footer__contact">
            <span className="es-footer__contact-line">info@eventsync.edu.lk</span>
            <span className="es-footer__contact-line">Malabe Campus, Sri Lanka</span>
          </p>
          <div className="es-footer__social" aria-label="Social">
            <span className="es-footer__social-btn" title="Facebook" />
            <span className="es-footer__social-btn" title="X" />
            <span className="es-footer__social-btn" title="LinkedIn" />
            <span className="es-footer__social-btn" title="Instagram" />
          </div>
          <div className="es-footer__status">
            <span className="es-footer__status-dot" aria-hidden />
            System status: All systems operational
          </div>
        </div>

        <div className="es-footer__cols">
          <div>
            <h4 className="es-footer__heading">Platform</h4>
            <ul className="es-footer__links">
              <li><Link to="/allocation-dashboard">Dashboard</Link></li>
              <li><Link to="/allocation-profile">Profile</Link></li>
              <li><Link to="/allocation-calendar">Calendar</Link></li>
              <li><Link to="/allocation-requests">Requests</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="es-footer__heading">Resources</h4>
            <ul className="es-footer__links">
              <li><Link to="/allocation-venues">Venues</Link></li>
              <li><Link to="/allocation-resources">Inventory</Link></li>
              <li><Link to="/allocation-issues">Help</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="es-footer__heading">Campus</h4>
            <ul className="es-footer__links">
              <li><Link to="/allocation-approved">Bookings</Link></li>
              <li><Link to="/allocation-pre-event">Pre-event</Link></li>
              <li><Link to="/allocation-conflicts">Conflicts</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="es-footer__bottom">
        <p>&copy; {new Date().getFullYear()} EventSync. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
