import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { User } from 'lucide-react';

export default function OfficerProfile() {
  const { currentUser } = useProcurement();

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Officer Credentials</h2>
        <p className="page-subtitle">Assigned procurement authority details.</p>
      </div>

      <div className="card" style={{ maxWidth: '500px' }}>
        <h3 className="card-title"><User size={18} /> Credentials</h3>
        <div className="space-y-4 text-sm" style={{ lineHeight: 1.6 }}>
          <div>
            <span className="text-muted block text-xs font-medium">Officer Name</span>
            <span className="font-semibold text-slate-800">{currentUser?.name || 'Rajesh Kumar'}</span>
          </div>
          <div>
            <span className="text-muted block text-xs font-medium">Officer ID</span>
            <span className="font-bold font-mono text-slate-800">{currentUser?.officerId || 'OFF-2026-99'}</span>
          </div>
          <div>
            <span className="text-muted block text-xs font-medium">Assigned Facility</span>
            <span className="font-semibold text-slate-800">{currentUser?.assignedCentre || 'Madurai Procurement Centre 03'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
