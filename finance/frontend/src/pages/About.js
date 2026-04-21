import React from 'react';
import { getCampusConfig } from '../config/tenant';

export function About() {
  const { campusName } = getCampusConfig();

  return (
    <div className="page">
      <div className="main-pad-lg">
        <div className="wrap">
          <div className="card">
            <div className="eyebrow">
              <span className="eyebrow-dot" /> About Sri Lanka Institute of Information Technology (SLIIT)
            </div>
            <h1 className="section-title" style={{ fontSize: '2rem' }}>
              Empowering Students Through Engaging Events
            </h1>
            <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginTop: 10 }}>
              The Sri Lanka Institute of Information Technology (SLIIT) is a premier higher education institute in Sri Lanka. 
              We believe that student life extends far beyond the classroom. Our campus is vibrant with numerous events 
              throughout the academic year, aimed at fostering innovation, leadership, cultural exchange, and pure fun.
            </p>
            <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginTop: 10 }}>
              From prestigious tech hackathons like SLIIT Robofest, to grand cultural festivals such as SLIIT's Got Talent, 
              there is always an event taking place to bring our community together. EventSync helps streamline the proposal 
              and management of these fantastic events.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
              <div className="badge b-app">
                <span className="bdot" />
                Academic Conferences
              </div>
              <div className="badge b-sub">
                <span className="bdot" />
                Cultural Festivals
              </div>
              <div className="badge b-rev">
                <span className="bdot" />
                Hackathons & Tech Events
              </div>
              <div className="badge b-done">
                <span className="bdot" />
                Sports Meets
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
