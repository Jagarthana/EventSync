import React from 'react';

const FAQS = [
  {
    q: 'Who can submit an event proposal?',
    a: 'Any registered club, society, or faculty member at SLIIT can submit a proposal through EventSync.',
  },
  {
    q: 'How far in advance should I submit my proposal?',
    a: 'Proposals should be submitted at least 3 weeks prior to the event date to allow sufficient time for approvals and resource allocation.',
  },
  {
    q: 'How do I book a venue like the Main Auditorium?',
    a: 'Venue booking is handled in Phase 5 of the event workflow. Once your initial proposal is approved, you can request specific venues and resources.',
  },
  {
    q: 'Who approves the final budget?',
    a: 'The Student Affairs Directorate and the Finance Department review and approve all budgets.',
  },
  {
    q: 'Can I edit my proposal after submission?',
    a: 'Yes, proposals can be edited as long as they have not yet entered the approval stage. Once submitted to the approver, you must contact the Student Affairs Office to request amendments.',
  },
  {
    q: 'How do I request audio/visual or technical equipment?',
    a: 'Equipment requests are made through the Resource Request module in Phase 5. Specify the type, quantity, and duration of equipment needed.',
  },
  {
    q: 'How long does the approval process typically take?',
    a: 'The average approval turnaround is 48 hours per stage. Events with budgets above LKR 100,000 may require additional review time.',
  },
  {
    q: 'Can external guests or speakers be invited to SLIIT events?',
    a: 'Yes, external parties can be invited. You must list external participants in your proposal and obtain clearance from the Student Affairs Directorate.',
  },
  {
    q: 'What happens after my event is completed?',
    a: 'You are required to submit a post-event report through EventSync within 7 working days. This includes attendance figures, a financial summary, and photographs.',
  },
  {
    q: 'Is there a maximum budget limit for student-organized events?',
    a: 'Budget limits vary by event type and organizing body. Club events typically have a ceiling set by the Student Affairs Office. Contact them for the current academic year limits.',
  },
  {
    q: 'Can I view events organized by other clubs or faculties?',
    a: 'Yes, the Events page on EventSync lists all past and upcoming events at SLIIT. You can also visit the official SLIIT Events page at sliit.lk/events for announcements.',
  },
  {
    q: 'What should I do if my proposal is rejected?',
    a: 'If your proposal is rejected, you will receive feedback via EventSync. You may revise and resubmit the proposal addressing the reviewer\'s comments within 5 working days.',
  },
];

export function Help() {
  return (
    <div className="page">
      <div className="main-pad-lg">
        <div className="wrap">
          <div className="card">
            <div className="eyebrow">
              <span className="eyebrow-dot" /> Help &amp; Support
            </div>
            <h1 className="section-title" style={{ fontSize: '2rem' }}>
              University Event Procedures FAQ
            </h1>
            <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginTop: 10 }}>
              Find answers to common questions regarding event proposals, resource allocation, and approvals at SLIIT.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'flex-start' }}>
            <div className="card" style={{ flex: '1 1 500px', margin: 0 }}>
              <h3 className="section-title" style={{ marginBottom: 15 }}>
                Frequently Asked Questions
              </h3>
              <div style={{ display: 'grid', gap: 14 }}>
                {FAQS.map((faq, i) => (
                  <div key={i}>
                    <div className="alert alert-teal" style={{ marginBottom: 4 }}>
                      <span style={{ fontWeight: 800 }}>Q:</span>&nbsp;{faq.q}
                    </div>
                    <div className="alert alert-rose" style={{ marginBottom: 0 }}>
                      <span style={{ fontWeight: 800 }}>A:</span>&nbsp;{faq.a}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ flex: '0 0 300px', width: '100%', background: 'var(--surface-alt)', border: '1px solid var(--border)', textAlign: 'center', margin: 0 }}>
               <div style={{ width: '60px', height: '60px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', boxShadow: 'var(--sh-sm)' }}>
                 <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="var(--rose)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                 </svg>
               </div>
               <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'var(--text-1)' }}>EventSync AI Assistant</h3>
               <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', marginBottom: '20px', lineHeight: 1.6 }}>
                 Have quick questions? Need help navigating the event procedures? Our AI bot will be here to help!
               </p>
               <div className="badge b-rev" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                 <span className="bdot" />
                 Coming Soon
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
