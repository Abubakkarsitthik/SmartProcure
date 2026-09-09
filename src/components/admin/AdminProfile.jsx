import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { User, Shield } from 'lucide-react';

export default function AdminProfile() {
  const { currentUser } = useProcurement();

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Administrator Profile</h2>
        <p className="page-subtitle">System administrator credentials and department information.</p>
      </div>

      <div className="card" style={{ maxWidth: '500px' }}>
        <h3 className="card-title"><Shield size={18} className="text-blue-600" /> Admin Credentials</h3>
        <div className="space-y-4 text-sm" style={{ lineHeight: 1.6 }}>
          <div>
            <span className="text-muted block text-xs font-medium">Administrator Name</span>
            <span className="font-semibold text-slate-800">{currentUser?.name || 'Dr. S. Venkatesan'}</span>
          </div>
          <div>
            <span className="text-muted block text-xs font-medium">Designation</span>
            <span className="font-semibold text-slate-800">{currentUser?.designation || 'State Procurement Director'}</span>
          </div>
          <div>
            <span className="text-muted block text-xs font-medium">Department</span>
            <span className="font-semibold text-slate-800">{currentUser?.department || 'Department of Agriculture, Tamil Nadu'}</span>
          </div>
          <div>
            <span className="text-muted block text-xs font-medium">Contact</span>
            <span className="font-mono font-semibold text-slate-800">{currentUser?.mobile || '9900000001'}</span>
          </div>
          <div>
            <span className="text-muted block text-xs font-medium">Role</span>
            <span className="badge badge-secondary text-xs">System Administrator</span>
          </div>
        </div>
      </div>
    </div>
  );
}
