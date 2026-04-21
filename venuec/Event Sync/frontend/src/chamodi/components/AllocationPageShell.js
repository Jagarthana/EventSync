import React from 'react';
import AllocationSidebar from './AllocationSidebar';

function AllocationPageShell({ eyebrow, title, subtitle, actions, children }) {
  return (
    <div className="allocation-shell">
      <AllocationSidebar />
      <main className="allocation-main">
        <header className="page-head">
          <div className="page-head-text">
            {eyebrow && <span className="page-eyebrow">• {eyebrow}</span>}
            <h1 className="page-title-serif">{title}</h1>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
          {actions ? <div className="page-head-actions">{actions}</div> : null}
        </header>
        {children}
      </main>
    </div>
  );
}

export default AllocationPageShell;
