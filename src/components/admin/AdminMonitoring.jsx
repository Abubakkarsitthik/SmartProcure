import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Activity, AlertTriangle, Building2, ClipboardList, Filter } from 'lucide-react';

export default function AdminMonitoring() {
  const { centres, requests } = useProcurement();
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDistrict, setFilterDistrict] = useState('All');

  // Status breakdown
  const statusCounts = {};
  requests.forEach(r => {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  });

  // District breakdown
  const districtCounts = {};
  requests.forEach(r => {
    const d = r.district || 'Unknown';
    districtCounts[d] = (districtCounts[d] || 0) + 1;
  });
  const topDistricts = Object.entries(districtCounts).sort((a, b) => b[1] - a[1]);

  // Crop breakdown
  const cropCounts = {};
  requests.forEach(r => {
    const c = r.crop || 'Unknown';
    cropCounts[c] = (cropCounts[c] || 0) + 1;
  });
  const topCrops = Object.entries(cropCounts).sort((a, b) => b[1] - a[1]);

  // Facility utilization
  const facilityStats = centres.map(c => {
    const total = c.totalCapacity || 1;
    const remaining = c.capacityRemaining || 0;
    const utilPct = Math.round(((total - remaining) / total) * 100);
    const reqCount = requests.filter(r => r.centreId === c.id).length;
    return { ...c, utilPct, reqCount };
  }).sort((a, b) => b.utilPct - a.utilPct);

  // Filtered requests
  const filteredRequests = requests.filter(r => {
    if (filterStatus !== 'All' && r.status !== filterStatus) return false;
    if (filterDistrict !== 'All' && r.district !== filterDistrict) return false;
    return true;
  });

  const uniqueDistricts = [...new Set(requests.map(r => r.district).filter(Boolean))].sort();
  const uniqueStatuses = [...new Set(requests.map(r => r.status).filter(Boolean))].sort();

  // Alerts
  const overloadedFacilities = centres.filter(c => c.riskLevel === 'High');
  const pendingRequests = requests.filter(r => r.status === 'Pending' || r.status === 'Submitted');

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Procurement Monitoring</h2>
        <p className="page-subtitle">System-wide procurement activity and operational overview.</p>
      </div>

      {/* Status Breakdown Cards */}
      <div className="grid-4col mb-6">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">{status}</span>
              <ClipboardList size={16} className="text-muted" />
            </div>
            <span className="stat-card-value text-slate-800">{count}</span>
          </div>
        ))}
      </div>

      {/* Alerts Section */}
      {(overloadedFacilities.length > 0 || pendingRequests.length > 0) && (
        <div className="card mb-6">
          <h3 className="card-title"><AlertTriangle size={18} className="text-red-600" /> Operational Alerts</h3>
          <div className="space-y-2">
            {overloadedFacilities.map(c => (
              <div key={c.id} className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                <strong className="text-red-800">{c.name}</strong> — High capacity risk. Queue: {c.queueLength || 0}, Remaining: {(c.capacityRemaining || 0).toLocaleString('en-IN')} kg
              </div>
            ))}
            {pendingRequests.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-sm">
                <strong className="text-amber-800">{pendingRequests.length} pending requests</strong> awaiting officer review.
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid-2col mb-6">
        {/* District Activity */}
        <div className="card">
          <h3 className="card-title"><Activity size={18} className="text-green-600" /> Requests by District</h3>
          <div className="space-y-2">
            {topDistricts.map(([d, count]) => {
              const pct = Math.round((count / requests.length) * 100);
              return (
                <div key={d}>
                  <div className="flex-between text-sm mb-1">
                    <span className="font-medium text-slate-800">{d}</span>
                    <span className="text-muted">{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--secondary)', borderRadius: '3px' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Crop Distribution */}
        <div className="card">
          <h3 className="card-title"><Activity size={18} className="text-amber-600" /> Requests by Crop</h3>
          <div className="space-y-2">
            {topCrops.map(([crop, count]) => {
              const pct = Math.round((count / requests.length) * 100);
              return (
                <div key={crop}>
                  <div className="flex-between text-sm mb-1">
                    <span className="font-medium text-slate-800">{crop}</span>
                    <span className="text-muted">{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--accent)', borderRadius: '3px' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Facility Utilization Table */}
      <div className="card mb-6">
        <h3 className="card-title"><Building2 size={18} className="text-blue-600" /> Facility Utilization & Activity</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Facility</th>
                <th>District</th>
                <th>Utilization</th>
                <th>Queue</th>
                <th>Requests</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {facilityStats.map(c => (
                <tr key={c.id}>
                  <td className="font-medium text-xs">{c.name}</td>
                  <td>{c.district}</td>
                  <td>
                    <div className="flex-align" style={{ gap: '8px' }}>
                      <div style={{ width: '60px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(100, c.utilPct)}%`,
                          height: '100%',
                          backgroundColor: c.utilPct > 90 ? 'var(--danger)' : c.utilPct > 75 ? 'var(--accent)' : 'var(--secondary)',
                          borderRadius: '3px'
                        }}></div>
                      </div>
                      <span className="text-xs font-semibold">{c.utilPct}%</span>
                    </div>
                  </td>
                  <td className="text-sm">{c.queueLength || 0}</td>
                  <td className="text-sm">{c.reqCount}</td>
                  <td>
                    <span className={`badge text-xs ${
                      c.riskLevel === 'High' ? 'badge-danger' :
                      c.riskLevel === 'Medium' ? 'badge-warning' : 'badge-success'
                    }`}>{c.riskLevel || 'Low'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filtered Request List */}
      <div className="card">
        <h3 className="card-title"><Filter size={18} /> Procurement Requests ({filteredRequests.length})</h3>
        <div className="flex-gap mb-4">
          <select className="form-select text-xs" style={{ maxWidth: '180px' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="form-select text-xs" style={{ maxWidth: '180px' }} value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)}>
            <option value="All">All Districts</option>
            {uniqueDistricts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Farmer</th>
                <th>Crop</th>
                <th>Quantity</th>
                <th>District</th>
                <th>Status</th>
                <th>Facility</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.slice(0, 20).map(r => (
                <tr key={r.id}>
                  <td className="font-mono font-semibold text-xs">{r.id}</td>
                  <td className="font-medium text-xs">{r.farmerName}</td>
                  <td className="text-xs">{r.crop}</td>
                  <td className="text-xs">{r.quantity} {r.unit || 'kg'}</td>
                  <td>{r.district}</td>
                  <td>
                    <span className={`badge text-xs ${
                      r.status === 'Completed' ? 'badge-success' :
                      r.status === 'Scheduled' ? 'badge-warning' :
                      r.status === 'Rejected' ? 'badge-danger' : 'badge-neutral'
                    }`}>{r.status}</span>
                  </td>
                  <td className="text-xs text-muted">{r.centreName || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
