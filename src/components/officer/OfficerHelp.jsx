import React from 'react';

export default function OfficerHelp() {
  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Officer Operation Guide</h2>
        <p className="page-subtitle">Standard operating manual for district procurement officers.</p>
      </div>

      <div className="card">
        <h3 className="card-title">Coordinator Manual</h3>
        <div className="space-y-4" style={{ lineHeight: 1.6 }}>
          <div>
            <h4 className="font-semibold text-sm text-slate-800">How do I review farmer requests?</h4>
            <p className="text-sm text-muted">Open Farmer Requests, click Review. Verify farmer district, crop, and quantity against AI recommendations before confirming centre allocation.</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-800">How do Smart Slots &amp; Tokens work?</h4>
            <p className="text-sm text-muted">After confirming an eligible facility, select a recommended time slot to issue a gate pass token automatically.</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-800">How do I handle overload redistribution?</h4>
            <p className="text-sm text-muted">Navigate to AI Forecast &amp; Overload. When a facility experiences excess expected demand, the AI calculates an optimal alternative centre in the district. Review and approve the redistribution recommendation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
