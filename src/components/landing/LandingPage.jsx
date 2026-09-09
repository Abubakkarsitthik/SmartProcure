import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function LandingPage({ onFarmerAccess, onOfficerAccess }) {
  return (
    <div className="landing-container">
      <section className="landing-hero">
        <div className="landing-hero-pattern"></div>
        <div className="landing-hero-content">
          <div className="landing-tag">Tamil Nadu Smart Procurement Portal</div>
          <h1 className="landing-hero-title">SMARTPROCURE</h1>
          <p className="landing-hero-subtitle">
            Location-Based Facility Selection, AI Queue Optimization & Direct Procurement
          </p>
          <p className="landing-hero-desc">
            An AI-assisted procurement coordination system for Tamil Nadu farmers and district procurement officers to schedule produce deliveries, eliminate yard congestion, and automate gate tokens.
          </p>
          <div className="landing-hero-actions">
            <button className="btn btn-secondary btn-lg" onClick={onFarmerAccess}>
              Farmer Access
            </button>
            <button 
              className="btn btn-outline btn-lg" 
              style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', background: 'transparent' }} 
              onClick={onOfficerAccess}
            >
              Officer Login
            </button>
          </div>
        </div>
      </section>

      {/* End-to-End Workflow */}
      <section className="workflow-section">
        <h2 className="section-title">Location-Based Procurement Coordination Workflow</h2>
        <div className="workflow-flow">
          <div className="workflow-node">
            <div className="workflow-icon-box">1</div>
            <span className="workflow-node-title">Tamil Nadu & District</span>
          </div>
          <div className="workflow-arrow"><ChevronRight /></div>
          <div className="workflow-node">
            <div className="workflow-icon-box">2</div>
            <span className="workflow-node-title">Crop & Quantity</span>
          </div>
          <div className="workflow-arrow"><ChevronRight /></div>
          <div className="workflow-node">
            <div className="workflow-icon-box" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>AI</div>
            <span className="workflow-node-title">AI Facility Recommendation</span>
          </div>
          <div className="workflow-arrow"><ChevronRight /></div>
          <div className="workflow-node">
            <div className="workflow-icon-box">4</div>
            <span className="workflow-node-title">Officer Review</span>
          </div>
          <div className="workflow-arrow"><ChevronRight /></div>
          <div className="workflow-node">
            <div className="workflow-icon-box">5</div>
            <span className="workflow-node-title">Smart Slot & Token</span>
          </div>
          <div className="workflow-arrow"><ChevronRight /></div>
          <div className="workflow-node">
            <div className="workflow-icon-box">6</div>
            <span className="workflow-node-title">Live Queue & Weighing</span>
          </div>
          <div className="workflow-arrow"><ChevronRight /></div>
          <div className="workflow-node">
            <div className="workflow-icon-box">7</div>
            <span className="workflow-node-title">DBT Bank Transfer</span>
          </div>
        </div>
      </section>
    </div>
  );
}
