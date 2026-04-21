import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isValidSliitStudentEmail, STUDENT_EMAIL_HINT } from '../utils/sliitStudentEmail';

function getPasswordStrength(val) {
  if (!val) return 0;
  let s = 0;
  if (val.length >= 8) s++;
  if (/[A-Z]/.test(val)) s++;
  if (/[0-9]/.test(val)) s++;
  if (/[^A-Za-z0-9]/.test(val)) s++;
  return s;
}

const DEPARTMENTS = [
  'Faculty of Engineering',
  'Faculty of Science',
  'Faculty of Arts & Humanities',
  'Faculty of Business',
  'Faculty of Medicine',
  'Faculty of Law',
];

export function Register() {
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const pwStrength = getPasswordStrength(password);
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName || !cleanEmail || !department) {
      setError('Please fill out all required fields.');
      return;
    }
    if (!isValidSliitStudentEmail(cleanEmail)) {
      setError(STUDENT_EMAIL_HINT);
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await registerUser(cleanName, cleanEmail, password, 'Organizer');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
          <h2 className="auth-title">Create your account</h2>
          <p className="auth-sub">Join the university event management platform</p>

          <div className="role-grid">
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
              <div className="role-btn-sub">Created by system admin</div>
            </button>
          </div>

          {role === 'official' ? (
            <div>
              {error && (
                <div className="alert alert-rose" style={{ marginBottom: 16 }}>
                  {error}
                </div>
              )}
              <div
                className="auth-sub"
                style={{ textAlign: 'left', lineHeight: 1.55, padding: '12px 0 8px' }}
              >
                <p style={{ margin: '0 0 12px' }}>
                  Official officer accounts are <strong>not</strong> self-service. They are created only by the system
                  administrator for designated Governance, Finance, and Venue officers.
                </p>
                <p style={{ margin: 0 }}>
                  If you are a student organizer, switch to <strong>Student</strong> and register with your{' '}
                  <code style={{ fontSize: '0.9em' }}>@my.sliit.lk</code> email.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-prim btn-full btn-lg"
                style={{ marginTop: 20 }}
                onClick={() => {
                  setRole('student');
                  setError('');
                }}
              >
                Go to student registration
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="alert alert-rose" style={{ marginBottom: 16 }}>
                  {error}
                </div>
              )}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">
                  Full Name <span className="req">*</span>
                </label>
                <input
                  id="reg-name"
                  type="text"
                  className="form-control"
                  placeholder="e.g. John Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">
                  SLIIT student email <span className="req">*</span>
                </label>
                <input
                  id="reg-email"
                  type="email"
                  className="form-control"
                  placeholder="it12345678@my.sliit.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
                <div className="form-hint" style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>
                  {STUDENT_EMAIL_HINT}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-dept">
                  Department / Faculty <span className="req">*</span>
                </label>
                <select
                  id="reg-dept"
                  className="form-control"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="">Select your department</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-password">
                    Password <span className="req">*</span>
                  </label>
                  <input
                    id="reg-password"
                    type="password"
                    className="form-control"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <div className="pw-strength">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`pw-bar ${
                          pwStrength >= i ? (pwStrength <= 2 ? 'weak' : pwStrength === 3 ? 'med' : 'strong') : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-confirm">
                    Confirm Password <span className="req">*</span>
                  </label>
                  <input
                    id="reg-confirm"
                    type="password"
                    className="form-control"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-prim btn-full btn-lg" style={{ marginTop: 4 }}>
                Create Account{' '}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </form>
          )}

          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
