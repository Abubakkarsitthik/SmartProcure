import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function AdminHelp() {
  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Administrator Guide</h2>
        <p className="page-subtitle">System administration manual and operational guidelines.</p>
      </div>

      <div className="card">
        <h3 className="card-title"><HelpCircle size={18} /> Administration Manual</h3>
        <div className="space-y-4" style={{ lineHeight: 1.6 }}>
          <div>
            <h4 className="font-semibold text-sm text-slate-800">How do I manage system users?</h4>
            <p className="text-sm text-muted">Navigate to User Management. Use the Farmers or Officers tab to view, search, and manage user accounts. You can activate or deactivate users as needed.</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-800">How do I manage procurement facilities?</h4>
            <p className="text-sm text-muted">Go to Facility Management to view all facilities, add new procurement centres or godowns, edit existing facility details, manage capacity, and import facilities via Excel.</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-800">How do I monitor procurement activity?</h4>
            <p className="text-sm text-muted">The Procurement Monitoring page provides system-wide visibility into requests by status, district, and crop. It also shows facility utilization and operational alerts for high-risk centres.</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-800">How do I view reports?</h4>
            <p className="text-sm text-muted">Reports &amp; Analytics provides procurement summaries, district-wise breakdowns, crop distribution, facility performance, and procurement completion statistics.</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-800">How do I manage master data?</h4>
            <p className="text-sm text-muted">Master Data shows the official list of 21 procurement commodities, all 38 Tamil Nadu districts, and the facility master overview. This data is centralized and used across the entire system.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
