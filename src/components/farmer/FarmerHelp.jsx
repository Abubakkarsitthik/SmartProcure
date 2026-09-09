import React from 'react';

export default function FarmerHelp({ onContactSupport }) {
  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Farmer Support & Frequently Asked Questions</h2>
        <p className="page-subtitle">Guide for Tamil Nadu procurement coordination.</p>
      </div>

      <div className="card">
        <h3 className="card-title">Procurement Portal Guide</h3>
        <div className="space-y-4" style={{ lineHeight: 1.6 }}>
          <div>
            <h4 className="font-semibold text-sm text-slate-800">How does the location hierarchy work?</h4>
            <p className="text-sm text-muted">First select Tamil Nadu, then your district (e.g. Madurai, Theni, Thanjavur), then enter crop and quantity. The system displays eligible procurement facilities in that district.</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-800">What is the AI Recommendation?</h4>
            <p className="text-sm text-muted">The system evaluates crop support, remaining capacity, queue length, and predicted wait times to highlight the optimal procurement centre in your district.</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-800">How is my Token generated?</h4>
            <p className="text-sm text-muted">Once the procurement officer approves your filing and assigns a facility and time slot, a unique Gate Pass Token is generated automatically.</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-800">Need additional assistance?</h4>
            <button className="btn btn-outline btn-sm mt-2" onClick={onContactSupport}>
              Contact Mandi Coordinator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
