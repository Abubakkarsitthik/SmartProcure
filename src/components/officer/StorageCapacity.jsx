import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';

export default function StorageCapacity() {
  const { centres } = useProcurement();

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Procurement Facility Storage Capacity</h2>
        <p className="page-subtitle">Real-time capacity tracking across Tamil Nadu procurement facilities.</p>
      </div>

      <div className="grid-3col">
        {centres.map(c => {
          // Use capacityRemaining for live available capacity
          const totalCap = c.totalCapacity || (c.capacityQuintals ? c.capacityQuintals * 100 : 1);
          const remaining = c.capacityRemaining !== undefined ? c.capacityRemaining : totalCap;
          const used = Math.max(0, totalCap - remaining);
          const utilPct = totalCap > 0 ? Math.min(100, Math.round((used / totalCap) * 100)) : 0;
          const isOperating = c.status === 'Operating' || c.operatingStatus === 'Operating';
          const unit = c.capacityUnit || 'kg';

          const riskLevel = utilPct >= 90 ? 'High' : utilPct >= 65 ? 'Medium' : 'Low';

          return (
            <div key={c.id} className="card" style={{ opacity: isOperating ? 1 : 0.7 }}>
              <div className="flex-between mb-4">
                <h4 style={{ fontWeight: 600, fontSize: '16px', flex: 1 }}>{c.name}</h4>
                <span className={`badge text-xs ${
                  riskLevel === 'High' ? 'badge-danger' :
                  riskLevel === 'Medium' ? 'badge-warning' : 'badge-success'
                }`}>{riskLevel}</span>
              </div>

              <div className="space-y-2 text-sm" style={{ lineHeight: 1.5 }}>
                <div className="flex-between">
                  <span className="text-muted">District:</span>
                  <span className="font-semibold">{c.district}</span>
                </div>
                <div className="flex-between">
                  <span className="text-muted">Facility Type:</span>
                  <span className="font-semibold text-xs">{c.type}</span>
                </div>
                <div className="flex-between">
                  <span className="text-muted">Total Capacity:</span>
                  <span className="font-semibold">
                    {unit === 'Quintals'
                      ? `${Math.round(totalCap / 100)} q`
                      : `${totalCap.toLocaleString('en-IN')} kg`}
                  </span>
                </div>
                <div className="flex-between">
                  <span className="text-muted">Available Remaining:</span>
                  <span className={`font-bold ${remaining > 0 ? 'text-green-700' : 'text-red-600'}`}>
                    {unit === 'Quintals'
                      ? `${Math.round(remaining / 100)} q`
                      : `${remaining.toLocaleString('en-IN')} kg`}
                  </span>
                </div>
                <div className="flex-between">
                  <span className="text-muted">Status:</span>
                  <span className={`font-semibold text-xs ${isOperating ? 'text-green-700' : 'text-slate-500'}`}>
                    {isOperating ? 'Operating' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div className="flex-between text-xs">
                  <span className="text-muted">Storage Utilization:</span>
                  <span className="font-bold text-slate-800">{utilPct}%</span>
                </div>
                <div style={{ height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${utilPct}%`,
                    height: '100%',
                    backgroundColor: riskLevel === 'High' ? 'var(--danger)' : riskLevel === 'Medium' ? 'var(--accent)' : 'var(--secondary)',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
