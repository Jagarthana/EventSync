import React from 'react';

import { Link, useLocation } from 'react-router-dom';

import { getInitials } from '../utils/userDisplay';

import { useOfficerProfile } from '../context/OfficerProfileContext';

import '../styles/Header.css';



function Header({ isLoggedIn, userRole, onLogout, userEmail }) {

  const location = useLocation();

  const isLogin = location.pathname === '/login';

  const showUser = isLoggedIn && userRole === 'allocation';

  const { profile } = useOfficerProfile();

  const email = profile.email || userEmail || '';

  const initials = getInitials(email, profile.displayName);



  const noopLink = (e) => e.preventDefault();



  return (

    <header className={`es-header${isLogin ? ' es-header--minimal' : ''}`}>

      <div className="es-header__left">

        <Link to={showUser ? '/allocation-dashboard' : '/login'} className="es-header__brand-block">

          <span className="es-header__logo-mark" aria-hidden>

            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">

              <path

                d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"

                fill="currentColor"

                stroke="currentColor"

                strokeWidth="1.25"

                strokeLinejoin="round"

              />

            </svg>

          </span>

          <span className="es-header__wordmark">

            <span className="es-header__wordmark-event">Event</span>

            <span className="es-header__wordmark-sync">Sync</span>

          </span>

        </Link>

        {showUser && (

          <>

            <span className="es-header__divider" aria-hidden />

            <span className="es-header__portal">Allocation Officer Portal</span>

          </>

        )}

      </div>



      {showUser && (

        <nav className="es-header__nav es-header__nav--center" aria-label="Main">

          <Link to="/allocation-dashboard">Home</Link>

          <a href="#events" onClick={noopLink}>

            Events

          </a>

          <a href="#about" onClick={noopLink}>

            About

          </a>

          <a href="#help" onClick={noopLink}>

            Help

          </a>

        </nav>

      )}



      {!isLogin && !showUser && (

        <nav className="es-header__nav" aria-label="Primary">

          <Link to="/login">Home</Link>

        </nav>

      )}



      {showUser ? (

        <div className="es-header__right">

          <button type="button" className="es-header__notif" aria-label="Notifications">

            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">

              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />

            </svg>

            <span className="es-header__notif-dot" aria-hidden />

          </button>

          <Link to="/allocation-profile" className="es-header__pill">

            <span className="es-header__avatar" aria-hidden>

              {profile.avatarDataUrl ? (

                <img src={profile.avatarDataUrl} alt="" className="es-header__avatar-img" />

              ) : (

                initials

              )}

            </span>

            <span className="es-header__pill-text">

              <span className="es-header__pill-name">{profile.displayName || 'Officer'}</span>

              <span className="es-header__pill-role">

                {profile.roleTitle || 'Venue and Resources Allocation Officer'}

              </span>

            </span>

          </Link>

          <button type="button" className="es-header__logout" onClick={onLogout}>

            Log Out

          </button>

        </div>

      ) : !isLogin ? (

        <div className="es-header__right">

          <Link to="/login" className="es-header__login-link">

            Login

          </Link>

        </div>

      ) : null}

    </header>

  );

}



export default Header;

