import React from 'react';
import { X, Building2, Users, Clock, Scale } from 'lucide-react';

export default function FacilityDetailsModal({ show, onClose, facility }) {
  if (!show || !facility) return null;

  const totalCap = facility.totalCapacity || (facility.capacityQuintals ? facility.capacityQuintals * 100 : 200000);
  const remainingCap = facility.capacityRemaining !== undefined ? facility.capacityRemaining : totalCap;
  const unit = facility.capacityUnit || 'Quintals';
  const utilPct = totalCap > 0 ? Math.round(((totalCap - remainingCap) / totalCap) * 100) : 0;

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: '600px', width: '90%' }}>
        <div className="modal-header flex-between">
          <div>
            <span className="font-mono text-xs text-muted font-bold block">{facility.facilityNumber || facility.id}</span>
            <h3 className="modal-title flex-align">
              <Building2 size={20} className="text-amber-600" />
              {facility.name || facility.facilityName}
            </h3>
          </div>
          <button className="btn btn-outline btn-xs" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body space-y-4">
          <div className="flex-between">
            <span className="badge badge-neutral">{facility.type || facility.facilityType}</span>
            <span className={`badge ${
              (facility.status === 'Operating' || facility.operatingStatus === 'Operating') ? 'badge-success' : 'badge-danger'
            }`}>
              {facility.status || facility.operatingStatus || 'Operating'}
            </span>
          </div>

          <div className="grid-2col text-sm space-y-2 p-3 bg-slate-50 rounded border">
            <div>
              <span className="text-muted block text-xs font-medium">State &amp; District</span>
              <span className="font-semibold">{facility.state || 'Tamil Nadu'} → {facility.district}</span>
            </div>
            <div>
              <span className="text-muted block text-xs font-medium">City / Town</span>
              <span className="font-semibold">{facility.city || facility.district}</span>
            </div>
            <div>
              <span className="text-muted block text-xs font-medium">Location Yard</span>
              <span className="text-xs text-slate-700">{facility.location}</span>
            </div>
            <div>
              <span className="text-muted block text-xs font-medium">Operating Hours</span>
              <span className="text-xs font-semibold">{facility.operatingHours || '08:00 AM - 05:00 PM'}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs text-muted font-semibold mb-2">Crops Supported</h4>
            <div className="flex-gap flex-wrap">
              {facility.cropsSupported ? facility.cropsSupported.map(c => (
                <span key={c} className="badge badge-secondary text-xs">{c}</span>
              )) : (
                <span className="text-xs text-muted">Paddy</span>
              )}
            </div>
          </div>

          <div className="card" style={{ padding: '16px' }}>
            <h4 className="text-xs font-semibold text-slate-700 mb-2">Capacity &amp; Utilization</h4>
            
            <div className="grid-2col text-sm mb-3">
              <div>
                <span className="text-muted block text-xs font-medium">Total Capacity</span>
                <span className="font-bold text-slate-800">
                  {unit === 'Quintals' ? `${Math.round(totalCap / 100)} quintals` : `${totalCap.toLocaleString('en-IN')} kg`}
                </span>
              </div>
              <div>
                <span className="text-muted block text-xs font-medium">Available Capacity</span>
                <span className="font-bold text-green-700">
                  {unit === 'Quintals' ? `${Math.round(remainingCap / 100)} quintals` : `${remainingCap.toLocaleString('en-IN')} kg`}
                </span>
              </div>
            </div>

            <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, utilPct)}%`,
                height: '100%',
                backgroundColor: utilPct > 90 ? 'var(--danger)' : utilPct > 75 ? 'var(--accent)' : 'var(--secondary)'
              }}></div>
            </div>
            <div className="flex-between text-xs text-muted mt-1 font-semibold">
              <span>{utilPct}% Utilized</span>
              <span>{100 - utilPct}% Free</span>
            </div>
          </div>

          <div className="grid-3col text-center text-xs">
            <div className="p-3 border rounded bg-white">
              <Users size={16} className="text-slate-600 mb-1" style={{ margin: '0 auto' }} />
              <span className="text-muted block font-medium">Current Queue</span>
              <span className="font-bold text-slate-800 text-sm">{facility.queueLength || 0} farmers</span>
            </div>
            <div className="p-3 border rounded bg-white">
              <Clock size={16} className="text-amber-600 mb-1" style={{ margin: '0 auto' }} />
              <span className="text-muted block font-medium">Predicted Wait</span>
              <span className="font-bold text-amber-700 text-sm">{facility.waitTime || 30} mins</span>
            </div>
            <div className="p-3 border rounded bg-white">
              <Scale size={16} className="text-green-600 mb-1" style={{ margin: '0 auto' }} />
              <span className="text-muted block font-medium">Active Counters</span>
              <span className="font-bold text-slate-800 text-sm">{facility.counters || 2} scales</span>
            </div>
          </div>
        </div>

        <div className="modal-footer pt-4 text-right" style={{ borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
