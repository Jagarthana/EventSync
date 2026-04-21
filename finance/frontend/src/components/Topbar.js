import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export function Topbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isEvents = location.pathname === '/events';
  const isAbout = location.pathname === '/about';
  const isHelp = location.pathname === '/help';

  return (
    <header className="topbar">
      <Link to="/" className="topbar-brand">
        <span className="brand-name">
          Event<em>Sync</em>
        </span>
      </Link>
      <nav className="topbar-center">
        <Link to="/" className={`tnav ${isHome ? 'act' : ''}`}>
          Home
        </Link>
        <Link to="/events" className={`tnav ${isEvents ? 'act' : ''}`}>
          Events
        </Link>
        <Link to="/about" className={`tnav ${isAbout ? 'act' : ''}`}>
          About
        </Link>
        <Link to="/help" className={`tnav ${isHelp ? 'act' : ''}`}>
          Help
        </Link>
      </nav>
      <div className="topbar-right">
        {user ? (
          <>
            <div className="topbar-user">
              <div className="topbar-avatar">
                {user.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() || 'U'}
              </div>
              <span className="topbar-uname">{user.name || 'User'}</span>
              <button type="button" className="btn-logout-top" onClick={logout}>
                Log Out
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-tlogin">
              Login
            </Link>
            <Link to="/register" className="btn-tcta">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
