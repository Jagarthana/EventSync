import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken } from '../api/client';
import { authService } from '../api/services';
import '../styles/Login.css';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('officer@event.lk');
  const [password, setPassword] = useState('officer123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await authService.login(
        String(email).trim(),
        String(password).trim()
      );
      setToken(data.token);
      onLogin(data.user.role, data.user.email);
      navigate('/allocation-dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Allocation Officer Portal</h2>
        <p>Login to manage venues and resources</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@event.lk"
              required
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="off"
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="btn-login" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Login'}
          </button>
        </form>
        <p className="demo-note">
          Demo: officer@event.lk / officer123. Start the API on port 5000 for server-side data, or set{' '}
          <code>REACT_APP_USE_LOCAL_STORE=true</code> in <code>.env.development</code> for offline-only.{' '}
          <button
            type="button"
            className="demo-note__link"
            onClick={() => {
              setEmail('officer@event.lk');
              setPassword('officer123');
              setError('');
            }}
          >
            Reset demo fields
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
