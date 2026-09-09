import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Users, Building2, ClipboardList, TrendingUp, CheckCircle, Clock, AlertTriangle, Activity } from 'lucide-react';

export default function AdminDashboard({ setActiveTab }) {
  const { centres, requests, farmers, officers } = useProcurement();

  const totalFarmers = farmers.length;
  const totalOfficers = officers.length;
  const activeOfficers = officers.filter(o => o.status === 'Active').length;
  const totalFacilities = centres.length;
  const activeFacilities = centres.filter(c => c.status === 'Operating' || c.operatingStatus === 'Operating').length;

  const activeRequests = requests.filter(r => !['Completed', 'Rejected'].includes(r.status)).length;
  const completedRequests = requests.filter(r => r.status === 'Completed').length;
  const pendingRequests = requests.filter(r => r.status === 'Pending' || r.status === 'Submitted').length;
  const scheduledRequests = requests.filter(r => r.status === 'Scheduled').length;

  const totalProcurementVolume = requests
    .filter(r => r.status === 'Completed')
    .reduce((sum, r) => sum + (Number(r.actualQuantity) || Number(r.quantity) || 0), 0);

  const avgUtilization = centres.length > 0
    ? Math.round(centres.reduce((sum, c) => {
        const total = c.totalCapacity || 1;
        const remaining = c.capacityRemaining || 0;
        return sum + ((total - remaining) / total) * 100;
      }, 0) / centres.length)
    : 0;

  const highRiskFacilities = centres.filter(c => c.riskLevel === 'High' || c.riskLevel === 'Medium');

  // District breakdown
  const districtMap = {};
  requests.forEach(r => {
    const d = r.district || 'Unknown';
    districtMap[d] = (districtMap[d] || 0) + 1;
  });
  const topDistricts = Object.entries(districtMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">System Administration Dashboard</h2>
        <p className="page-subtitle">High-level overview of SmartProcure operations across Tamil Nadu.</p>
      </div>

      {/* KPI Row */}
      <div className="grid-4col mb-6">
        <div className="stat-card" onClick={() => setActiveTab('users')} style={{ cursor: 'pointer' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Total Farmers</span>
            <Users size={18} className="text-green-600" />
          </div>
          <span className="stat-card-value text-slate-800">{totalFarmers}</span>
          <span className="stat-card-sub">Registered in system</span>
        </div>

        <div className="stat-card" onClick={() => setActiveTab('users')} style={{ cursor: 'pointer' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Procurement Officers</span>
            <Users size={18} className="text-blue-600" />
          </div>
          <span className="stat-card-value text-slate-800">{totalOfficers}</span>
          <span className="stat-card-sub">{activeOfficers} active</span>
        </div>

        <div className="stat-card" onClick={() => setActiveTab('facility-management')} style={{ cursor: 'pointer' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Total Facilities</span>
            <Building2 size={18} className="text-amber-600" />
          </div>
          <span className="stat-card-value text-slate-800">{totalFacilities}</span>
          <span className="stat-card-sub">{activeFacilities} operating</span>
        </div>

        <div className="stat-card" onClick={() => setActiveTab('monitoring')} style={{ cursor: 'pointer' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Avg. Utilization</span>
            <TrendingUp size={18} className="text-purple-600" />
          </div>
          <span className={`stat-card-value ${avgUtilization >= 90 ? 'text-red-600' : 'text-slate-800'}`}>{avgUtilization}%</span>
          <span className="stat-card-sub">Across all facilities</span>
        </div>
      </div>

      {/* Request Status Row */}
      <div className="grid-4col mb-6">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Active Requests</span>
            <ClipboardList size={18} className="text-amber-600" />
          </div>
          <span className="stat-card-value text-amber-700">{activeRequests}</span>
          <span className="stat-card-sub">{scheduledRequests} scheduled</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Completed</span>
            <CheckCircle size={18} className="text-green-600" />
          </div>
          <span className="stat-card-value text-green-700">{completedRequests}</span>
          <span className="stat-card-sub">Procurement fulfilled</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Pending Review</span>
            <Clock size={18} className="text-blue-600" />
          </div>
          <span className="stat-card-value text-blue-700">{pendingRequests}</span>
          <span className="stat-card-sub">Awaiting officer action</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Procurement Volume</span>
            <Activity size={18} className="text-green-600" />
          </div>
          <span className="stat-card-value text-slate-800">{totalProcurementVolume.toLocaleString('en-IN')} kg</span>
          <span className="stat-card-sub">Total completed</span>
        </div>
      </div>

      <div className="grid-2col mb-6">
        {/* Facility Risk Alerts */}
        <div className="card">
          <h3 className="card-title"><AlertTriangle size={18} className="text-amber-600" /> Operational Alerts</h3>
          {highRiskFacilities.length === 0 ? (
            <p className="text-sm text-muted">No high-risk facilities detected. All centres operating normally.</p>
          ) : (
            <div className="space-y-3">
              {highRiskFacilities.map(c => (
                <div key={c.id} className={`p-3 rounded border text-sm ${c.riskLevel === 'High' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex-between">
                    <strong className="text-slate-800">{c.name}</strong>
                    <span className={`badge text-xs ${c.riskLevel === 'High' ? 'badge-danger' : 'badge-warning'}`}>{c.riskLevel} Risk</span>
                  </div>
                  <p className="text-muted text-xs mt-1">{c.district} — Queue: {c.queueLength || 0} farmers, Capacity remaining: {(c.capacityRemaining || 0).toLocaleString('en-IN')} kg</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* District Activity Summary */}
        <div className="card">
          <h3 className="card-title"><Activity size={18} className="text-green-600" /> District Procurement Activity</h3>
          {topDistricts.length === 0 ? (
            <p className="text-sm text-muted">No procurement activity recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {topDistricts.map(([district, count]) => (
                <div key={district} className="flex-between text-sm p-2 border-b">
                  <span className="font-medium text-slate-800">{district}</span>
                  <span className="badge badge-neutral text-xs">{count} requests</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Requests Activity */}
      <div className="card">
        <h3 className="card-title"><ClipboardList size={18} /> Recent System Activity</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Farmer</th>
                <th>Crop</th>
                <th>District</th>
                <th>Status</th>
                <th>Facility</th>
              </tr>
            </thead>
            <tbody>
              {requests.slice(0, 8).map(r => (
                <tr key={r.id}>
                  <td className="font-mono font-semibold text-xs">{r.id}</td>
                  <td className="font-medium">{r.farmerName}</td>
                  <td>{r.crop}</td>
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
