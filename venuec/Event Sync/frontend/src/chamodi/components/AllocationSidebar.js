import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getInitials } from '../utils/userDisplay';
import { useOfficerProfile } from '../context/OfficerProfileContext';
import { setToken } from '../api/client';
import { dashboardService } from '../api/services';
import '../styles/AllocationSidebar.css';

const SECTIONS = [
  {
    key: 'DASHBOARD',
    items: [
      { to: '/allocation-dashboard', label: 'Overview', icon: 'overview', end: true },
      { to: '/allocation-profile', label: 'Profile', icon: 'user' },
    ],
  },
  {
    key: 'REQUESTS',
    items: [
      { to: '/allocation-requests', label: 'Incoming Requests', icon: 'inbox', badge: 'pending' },
      { to: '/allocation-conflicts', label: 'Conflict Resolution', icon: 'alert', badge: 'conflicts' },
      { to: '/allocation-approved', label: 'Approved Bookings', icon: 'check' },
    ],
  },
  {
    key: 'MANAGE',
    items: [
      { to: '/allocation-calendar', label: 'Master Calendar', icon: 'calendar' },
      { to: '/allocation-venues', label: 'Venue Management', icon: 'venue' },
      { to: '/allocation-resources', label: 'Resource Inventory', icon: 'box' },
      { to: '/allocation-pre-event', label: 'Pre-Event Preparation', icon: 'clipboard', badge: 'preEvent' },
      { to: '/allocation-issues', label: 'Issues & Maintenance', icon: 'wrench', badge: 'issues' },
    ],
  },
];

function NavIcon({ name }) {
  const common = {
    width: 20,
    height: 20,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  switch (name) {
    case 'overview':
      return (
        <svg {...common} viewBox="0 0 24 24" aria-hidden>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case 'user':
      return (
        <svg {...common} viewBox="0 0 24 24" aria-hidden>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case 'inbox':
      return (
        <svg {...common} viewBox="0 0 24 24" aria-hidden>
          <path d="M4 4h16c.55 0 1 .45 1 1v14c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1V5c0-.55.45-1 1-1z" />
          <path d="m22 6-10 7L2 6" />
        </svg>
      );
    case 'alert':
      return (
        <svg {...common} viewBox="0 0 24 24" aria-hidden>
          <path d="M12 9v4M12 17h.01" />
          <path d="M10.3 3.2L2.7 18c-.5 1 0 2.2 1.1 2.5h16.4c1.1-.3 1.6-1.5 1.1-2.5L13.7 3.2c-.5-1-1.9-1-2.4 0z" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common} viewBox="0 0 24 24" aria-hidden>
          <path d="M20 6L9 17l-5-5" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...common} viewBox="0 0 24 24" aria-hidden>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      );
    case 'venue':
      return (
        <svg {...common} viewBox="0 0 24 24" aria-hidden>
          <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4" />
        </svg>
      );
    case 'box':
      return (
        <svg {...common} viewBox="0 0 24 24" aria-hidden>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
        </svg>
      );
    case 'clipboard':
      return (
        <svg {...common} viewBox="0 0 24 24" aria-hidden>
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 12h6M9 16h6" />
        </svg>
      );
    case 'wrench':
      return (
        <svg {...common} viewBox="0 0 24 24" aria-hidden>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    default:
      return null;
  }
}

function badgeClass(key) {
  if (key === 'pending') return 'allocation-sidebar__badge allocation-sidebar__badge--amber';
  if (key === 'conflicts' || key === 'issues') return 'allocation-sidebar__badge allocation-sidebar__badge--rose';
  if (key === 'preEvent') return 'allocation-sidebar__badge allocation-sidebar__badge--accent';
  return 'allocation-sidebar__badge';
}

function AllocationSidebar() {
  const { profile } = useOfficerProfile();
  const email = profile.email || '';
  const initials = getInitials(email, profile.displayName);

  const [counts, setCounts] = useState({
    pending: 0,
    conflicts: 0,
    preEvent: 0,
    issues: 0,
  });

  useEffect(() => {
    const refresh = async () => {
      try {
        const { data } = await dashboardService.summary();
        setCounts({
          pending: data.pending ?? 0,
          conflicts: data.conflicts ?? 0,
          preEvent: data.preEvent ?? 0,
          issues: data.issues ?? 0,
        });
      } catch {
        setCounts({ pending: 0, conflicts: 0, preEvent: 0, issues: 0 });
      }
    };
    refresh();
    window.addEventListener('allocation-data-updated', refresh);
    window.addEventListener('allocation-profile-updated', refresh);
    const id = window.setInterval(refresh, 5000);
    return () => {
      window.removeEventListener('allocation-data-updated', refresh);
      window.removeEventListener('allocation-profile-updated', refresh);
      window.clearInterval(id);
    };
  }, []);

  const countFor = (badgeKey) => {
    if (!badgeKey) return 0;
    return counts[badgeKey] ?? 0;
  };

  const handleLogout = () => {
    setToken(null);
    window.location.assign('/login');
  };

  return (
    <aside className="allocation-sidebar" aria-label="Allocation officer navigation">
      <div className="allocation-sidebar__profile">
        <div className="allocation-sidebar__avatar" aria-hidden>
          {profile.avatarDataUrl ? (
            <img src={profile.avatarDataUrl} alt="" className="allocation-sidebar__avatar-img" />
          ) : (
            initials
          )}
        </div>
        <div className="allocation-sidebar__profile-text">
          <strong className="allocation-sidebar__name">{profile.displayName}</strong>
          <span className="allocation-sidebar__role">{profile.roleTitle}</span>
          {profile.department ? <span className="allocation-sidebar__dept">{profile.department}</span> : null}
        </div>
        <span className="allocation-sidebar__pill">• ALLOCATION OFFICER</span>
      </div>

      <nav className="allocation-sidebar__nav" aria-label="Main">
        {SECTIONS.map((section) => (
          <div key={section.key} className="allocation-sidebar__group">
            <div className="allocation-sidebar__section-label">{section.key}</div>
            <ul className="allocation-sidebar__list">
              {section.items.map((item) => {
                const n = item.badge ? countFor(item.badge) : 0;
                return (
                  <li key={`${section.key}-${item.to}-${item.label}`}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `allocation-sidebar__link${isActive ? ' allocation-sidebar__link--active' : ''}`
                      }
                      end={item.end === true}
                    >
                      <span className="allocation-sidebar__link-icon">
                        <NavIcon name={item.icon} />
                      </span>
                      <span className="allocation-sidebar__link-label">{item.label}</span>
                      {item.badge && n > 0 ? (
                        <span className={badgeClass(item.badge)}>{n > 99 ? '99+' : n}</span>
                      ) : null}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="allocation-sidebar__footer">
        <button type="button" className="allocation-sidebar__logout" onClick={handleLogout}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Log Out
        </button>
      </div>
    </aside>
  );
}

export default AllocationSidebar;
