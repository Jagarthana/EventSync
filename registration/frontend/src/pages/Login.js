import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isValidSliitStudentEmail, STUDENT_EMAIL_HINT } from '../utils/sliitStudentEmail';

export function Login() {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Please enter both email and password.');
      return;
    }

    if (role === 'student') {
      if (!isValidSliitStudentEmail(cleanEmail)) {
        setError(STUDENT_EMAIL_HINT);
        return;
      }
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        setError('Please enter a valid officer email address.');
        return;
      }
    }

    try {
      const portal = role === 'official' ? 'official' : 'student';
      const userData = await login(cleanEmail, password, { portal });
      const roles = userData?.roles || [];
      if (roles.includes('Admin')) {
        navigate('/super-admin');
      } else if (roles.includes('Governance')) {
        navigate('/dashboard-governance');
      } else if (roles.includes('Finance')) {
        navigate('/dashboard-finance');
      } else if (roles.includes('Venue')) {
        navigate('/dashboard-venue');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="page">
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="auth-logo">
            <span className="auth-logo-name">
              Event<em>Sync</em>
            </span>
          </div>
          <div className="role-grid" style={{ marginBottom: 20 }}>
            <button
              type="button"
              className={`role-btn ${role === 'student' ? 'sel' : ''}`}
              onClick={() => {
                setRole('student');
                setError('');
              }}
            >
              <div className="role-btn-icon">🎓</div>
              <div className="role-btn-label">Student</div>
              <div className="role-btn-sub">Organizer / Club</div>
            </button>
            <button
              type="button"
              className={`role-btn ${role === 'official' ? 'sel' : ''}`}
              onClick={() => {
                setRole('official');
                setError('');
              }}
            >
              <div className="role-btn-icon">🏛️</div>
              <div className="role-btn-label">Official</div>
              <div className="role-btn-sub">Gov / Finance / Venue</div>
            </button>
          </div>

          {role === 'official' && (
            <p
              className="auth-sub"
              style={{ textAlign: 'left', lineHeight: 1.55, margin: '0 0 16px', fontSize: 14 }}
            >
              Sign in with the <strong>officer email</strong> issued to you by the administrator. Student organizers must
              use the <strong>Student</strong> tab with an <code style={{ fontSize: '0.9em' }}>@my.sliit.lk</code>{' '}
              address.
            </p>
          )}

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-rose" style={{ marginBottom: 16 }}>
                {error}
              </div>
            )}
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                {role === 'student' ? 'SLIIT student email' : 'Officer email'}
              </label>
              <input
                id="login-email"
                type="email"
                className="form-control"
                placeholder={role === 'student' ? 'it12345678@my.sliit.lk' : 'your.issued.officer@email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
              {role === 'student' && (
                <div className="form-hint" style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>
                  {STUDENT_EMAIL_HINT}
                </div>
              )}
              {role === 'official' && (
                <div className="form-hint" style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>
                  Only designated Governance, Finance, and Venue officer accounts can sign in here.
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <div className="form-hint" style={{ textAlign: 'right' }}>
                <span style={{ color: 'var(--rose)', cursor: 'pointer', fontWeight: 600 }}>Forgot password?</span>
              </div>
            </div>
            <button type="submit" className="btn btn-prim btn-full btn-lg" style={{ marginTop: 4 }}>
              {role === 'official' ? 'Login' : 'Sign In'}{' '}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </form>

          {role === 'student' && (
            <div className="auth-footer">
              Don&apos;t have an account? <Link to="/register">Create one</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
