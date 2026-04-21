import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Finance departmental portal: official sign-in only (same API rules as governance).
 * Students use the main EventSync app with @my.sliit.lk.
 */
export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const clean = email.trim();
    if (!clean || !password) {
      setError('Please enter both email and password.');
      return;
    }
    try {
      const userData = await login(clean, password, { portal: 'official' });
      const roles = userData?.roles || [];
      if (roles.includes('Finance') || roles.includes('Admin')) {
        navigate('/dashboard-finance');
      } else {
        setError('This portal is for Finance officers. Use the Governance or Venue portal that matches your role.');
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
          <h2 className="auth-title" style={{ marginTop: 8 }}>
            Finance portal
          </h2>
          <p className="auth-sub" style={{ textAlign: 'left', lineHeight: 1.55 }}>
            Sign in with the <strong>officer email</strong> issued to you. Student organizers must use the main EventSync
            site with an <code style={{ fontSize: '0.9em' }}>@my.sliit.lk</code> student email.
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-rose" style={{ marginBottom: 16 }}>
                {error}
              </div>
            )}
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Officer email
              </label>
              <input
                id="login-email"
                type="email"
                className="form-control"
                placeholder="your.issued.officer@email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
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
            </div>
            <button type="submit" className="btn btn-prim btn-full btn-lg" style={{ marginTop: 4 }}>
              Sign in
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: 20 }}>
            Student organizer? <Link to="/register">Register</Link> or use the main EventSync student login.
          </div>
        </div>
      </div>
    </div>
  );
}
