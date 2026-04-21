import React from 'react';

const PAST_EVENTS = [
  {
    title: 'SLIIT Robofest 2025',
    category: 'Competition',
    date: 'March 2025',
    participants: '500+',
    img: 'https://www.sliit.lk/wp-content/uploads/2025/03/Robofest-2025-1.jpg',
    fallback: 'https://picsum.photos/seed/robofest25/480/200',
  },
  {
    title: 'SLIIT CodeFest 2025',
    category: 'Hackathon',
    date: 'October 2025',
    participants: '800+',
    img: 'https://www.sliit.lk/wp-content/uploads/2025/10/Codefest-2025.jpg',
    fallback: 'https://picsum.photos/seed/codefest25/480/200',
  },
  {
    title: "SLIIT's Got Talent 2024",
    category: 'Cultural',
    date: 'August 2024',
    participants: '1500+',
    img: 'https://www.sliit.lk/wp-content/uploads/2024/08/SGT-2024.jpg',
    fallback: 'https://picsum.photos/seed/sgt24/480/200',
  },
  {
    title: 'SLIIT Walk 2024',
    category: 'Charity',
    date: 'September 2024',
    participants: '5000+',
    img: 'https://www.sliit.lk/wp-content/uploads/2024/09/SLIIT-Walk-2024.jpg',
    fallback: 'https://picsum.photos/seed/walk24/480/200',
  },
  {
    title: 'SLIIT Career Day 2025',
    category: 'Academic',
    date: 'November 2025',
    participants: '2000+',
    img: 'https://www.sliit.lk/wp-content/uploads/2025/11/Career-Day-2025.jpg',
    fallback: 'https://picsum.photos/seed/careerday25/480/200',
  },
  {
    title: 'Robofest 2024',
    category: 'Competition',
    date: 'June 2024',
    participants: '450+',
    img: 'https://www.sliit.lk/wp-content/uploads/2024/06/Robofest-2024.jpg',
    fallback: 'https://picsum.photos/seed/robo24/480/200',
  },
  {
    title: 'SLIIT Convocation 2026',
    category: 'Ceremony',
    date: 'March 2026',
    participants: '700+',
    img: 'https://www.sliit.lk/wp-content/uploads/2026/03/Convocation-2026.jpg',
    fallback: 'https://picsum.photos/seed/conv26/480/200',
  },
  {
    title: 'SLIIT X-Treme Sports Meet',
    category: 'Sports',
    date: 'September 2025',
    participants: '1200+',
    img: 'https://www.sliit.lk/wp-content/uploads/2025/09/X-Treme-2025.jpg',
    fallback: 'https://picsum.photos/seed/xtreme25/480/200',
  },
  {
    title: 'SLIIT Kalanethra 2025',
    category: 'Cultural',
    date: 'March 2025',
    participants: '600+',
    img: 'https://www.sliit.lk/wp-content/uploads/2025/03/Kalanethra-2025.jpg',
    fallback: 'https://picsum.photos/seed/kalanethra25/480/200',
  },
  {
    title: 'SLIIT International Open Day 2025',
    category: 'Academic',
    date: 'August 2025',
    participants: '3000+',
    img: 'https://www.sliit.lk/wp-content/uploads/2025/08/Open-Day-2025.jpg',
    fallback: 'https://picsum.photos/seed/openday25/480/200',
  },
  {
    title: 'SLIIT Soft Skills+ 2024',
    category: 'Workshop',
    date: 'January 2024',
    participants: '300+',
    img: 'https://www.sliit.lk/wp-content/uploads/2024/01/SoftSkills-2024.jpg',
    fallback: 'https://picsum.photos/seed/softskills24/480/200',
  },
  {
    title: 'SLIIT Ganthera 2025',
    category: 'Cultural',
    date: 'June 2025',
    participants: '400+',
    img: 'https://www.sliit.lk/wp-content/uploads/2025/06/Ganthera-2025.jpg',
    fallback: 'https://picsum.photos/seed/ganthera25/480/200',
  },
];

export function Events() {
  return (
    <div className="page">
      <div className="main-pad-lg">
        <div className="wrap">
          <div className="card">
            <div className="eyebrow"><span className="eyebrow-dot" /> Gallery</div>
            <h1 className="section-title" style={{ fontSize: '1.8rem', marginBottom: 8 }}>Past SLIIT Events</h1>
            <p style={{ color: 'var(--text-2)', marginBottom: 24 }}>
              Take a look back at some of the most memorable events held at the Sri Lanka Institute of Information Technology.
              For official announcements, visit <a href="https://www.sliit.lk/events/" target="_blank" rel="noreferrer" style={{ color: 'var(--rose)', textDecoration: 'underline' }}>SLIIT Events</a>.
            </p>

            <div className="gallery-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
              marginTop: '20px'
            }}>
              {PAST_EVENTS.map((e) => (
                <div key={e.title} className="gallery-card" style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
                  <div className="gallery-img-wrap" style={{ position: 'relative' }}>
                    <img
                      className="gallery-img"
                      src={e.img}
                      alt={e.title}
                      style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                      onError={(ev) => { ev.target.onerror = null; ev.target.src = e.fallback; }}
                    />
                    <span className="gallery-tag" style={{ position: 'absolute', top: '10px', left: '10px', background: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-1)' }}>{e.category}</span>
                  </div>
                  <div className="gallery-body" style={{ padding: '16px' }}>
                    <div className="gallery-title" style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '8px' }}>{e.title}</div>
                    <div className="gallery-meta" style={{ fontSize: '0.8rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {e.date}
                      <span className="gallery-meta-dot" style={{ width: '4px', height: '4px', background: 'currentColor', borderRadius: '50%' }} />
                      {e.participants} Attendees
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
