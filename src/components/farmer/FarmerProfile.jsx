import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { User } from 'lucide-react';

export default function FarmerProfile() {
  const { currentUser } = useProcurement();

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Farmer Profile Information</h2>
        <p className="page-subtitle">Registered account preferences in Tamil Nadu.</p>
      </div>

      <div className="card" style={{ maxWidth: '500px' }}>
        <h3 className="card-title"><User size={18} /> Personal Details</h3>
        <div className="space-y-4 text-sm" style={{ lineHeight: 1.6 }}>
          <div>
            <span className="text-muted block text-xs font-medium">Farmer Name</span>
            <span className="font-semibold text-slate-800">{currentUser?.name || 'Arjun Kumar'}</span>
          </div>
          <div>
            <span className="text-muted block text-xs font-medium">State &amp; District</span>
            <span className="font-semibold text-slate-800">Tamil Nadu → {currentUser?.district || 'Madurai'}</span>
          </div>
          <div>
            <span className="text-muted block text-xs font-medium">Village / Location</span>
            <span className="font-semibold text-slate-800">{currentUser?.village || 'Vadipatti'}</span>
          </div>
          <div>
            <span className="text-muted block text-xs font-medium">Registered Mobile</span>
            <span className="font-mono font-semibold text-slate-800">{currentUser?.mobile || '9876543210'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
