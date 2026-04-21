import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCampusConfig } from '../config/tenant';

export function AnnBar() {
  const [hidden, setHidden] = useState(false);
  const { campusName } = getCampusConfig();
  if (hidden) return null;
  return (
    <div className="ann-bar">
      <span className="ann-pill">New</span>
      Proposal submissions open for Semester 2, 2026 at {campusName} —{' '}
      <Link to="/login">Apply now →</Link>
      <span className="ann-close" onClick={() => setHidden(true)} aria-label="Close">
        ✕
      </span>
    </div>
  );
}
