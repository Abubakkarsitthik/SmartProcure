import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  ClipboardList,
  Users,
  AlertTriangle,
  ArrowRight,
  AlertCircle,
  Clock
} from 'lucide-react';

export default function OfficerDashboard({ setActiveTab }) {
  const { centres, requests, queueItems } = useProcurement();

  // Primary Metrics
  const pendingRequests = requests.filter(r => r.status === 'Pending Officer Approval');
  const scheduledCount = requests.filter(r =>
    ['Scheduled', 'Arrived', 'Quality Check', 'Weighing', 'Processing'].includes(r.status)
  ).length;
  const activeQueueCount = queueItems.filter(item => item.status !== 'Completed').length;

  const maduraiCentres = centres.filter(c => c.district === 'Madurai');
  const totalCapacity = maduraiCentres.reduce((sum, c) => sum + (c.capacityQuintals || 0), 0);
  const totalExpected = maduraiCentres.reduce((sum, c) => sum + (c.currentExpectedQuintals || 0), 0);
  const avgUtilization = totalCapacity > 0 ? Math.round((totalExpected / totalCapacity) * 100) : 0;

  // Overloaded / At-risk Facilities
  const overloadedCentres = centres.filter(c => c.riskLevel === 'High' || (c.currentExpectedQuintals && c.capacityQuintals && c.currentExpectedQuintals > c.capacityQuintals));
  const highRiskCentre = overloadedCentres[0];

  return (
    <div>
      {/* Top Banner */}
      <div className="page-header flex-between">
        <div>
          <h2 className="page-title">Procurement Officer Command Console</h2>
          <p className="page-subtitle">
            District: Madurai, Tamil Nadu • Live operational status, facility loads, and active arrivals.
          </p>
        </div>
        <span className="badge badge-warning text-xs">District Level Supervisor</span>
      </div>

      {/* 1. COMPACT KPI ROW */}
      <div className="stats-grid mb-6">
        <div className="stat-card">
          <span className="stat-card-title">Pending Farmer Requests</span>
          <span className={`stat-card-value ${pendingRequests.length > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
            {pendingRequests.length}
          </span>
          <span className="stat-card-subtitle">Awaiting officer allocation</span>
          <ClipboardList className="stat-card-icon" />
        </div>

        <div className="stat-card">
          <span className="stat-card-title">Scheduled Arrivals</span>
          <span className="stat-card-value text-slate-800">
            {scheduledCount}
          </span>
          <span className="stat-card-subtitle">Scheduled gate entries today</span>
          <Clock className="stat-card-icon" />
        </div>

        <div className="stat-card">
          <span className="stat-card-title">Active Yard Queue</span>
          <span className="stat-card-value text-green-700">
            {activeQueueCount}
          </span>
          <span className="stat-card-subtitle">In queue or at weighing scale</span>
          <Users className="stat-card-icon" />
        </div>

        <div className="stat-card">
          <span className="stat-card-title">Capacity Utilization</span>
          <span className={`stat-card-value ${avgUtilization >= 90 ? 'text-red-600' : 'text-slate-800'}`}>
            {avgUtilization}%
          </span>
          <span className="stat-card-subtitle">District storage demand</span>
          <AlertTriangle className="stat-card-icon" />
        </div>
      </div>

      {/* 2. ACTION REQUIRED SECTION */}
      <div className="card mb-6" style={{ borderLeft: '4px solid var(--accent)' }}>
        <div className="flex-between mb-3 pb-2" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex-align">
            <AlertCircle size={18} className="text-amber-600" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginLeft: '8px' }}>
              Action Required
            </h3>
          </div>
          <span className="text-xs text-muted">Priority Operational Alerts</span>
        </div>

        <div className="space-y-3">
          {/* Action 1: Pending Requests */}
          {pendingRequests.length > 0 ? (
            <div className="flex-between p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm">
              <div>
                <strong>{pendingRequests.length} produce filing{pendingRequests.length > 1 ? 's' : ''} awaiting approval</strong>
                <div className="text-xs text-slate-600">Review crop varieties, verify district jurisdiction, and assign Mandi centres.</div>
              </div>
              <button
                className="btn btn-secondary btn-sm flex-align"
                onClick={() => setActiveTab && setActiveTab('requests')}
              >
                Review Requests <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="p-2 rounded bg-green-50 text-xs text-green-800 flex-align">
              ✓ All farmer requests have been reviewed and processed.
            </div>
          )}

          {/* Action 2: High Risk / Overloaded Facility */}
          {highRiskCentre && (
            <div className="flex-between p-3 rounded-lg bg-red-50 border border-red-200 text-sm">
              <div>
                <strong className="text-red-800">{highRiskCentre.name} approaching capacity threshold</strong>
                <div className="text-xs text-slate-600">
                  Storage load at {Math.round(((highRiskCentre.totalCapacity - (highRiskCentre.capacityRemaining || 0)) / highRiskCentre.totalCapacity) * 100)}%. Consider redistribution to adjacent yards.
                </div>
              </div>
              <button
                className="btn btn-outline btn-sm flex-align text-red-800 border-red-300"
                onClick={() => setActiveTab && setActiveTab('capacity-forecast')}
              >
                View Capacity &amp; Forecast <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Action 3: Active Processing Yard */}
          {activeQueueCount > 0 && (
            <div className="flex-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm">
              <div>
                <strong>{activeQueueCount} farmer{activeQueueCount > 1 ? 's' : ''} in yard queue</strong>
                <div className="text-xs text-slate-600">Weigh incoming trucks, verify produce moisture, and issue digital receipts.</div>
              </div>
              <button
                className="btn btn-outline btn-sm flex-align"
                onClick={() => setActiveTab && setActiveTab('queue-yard')}
              >
                Open Queue &amp; Yard <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. FACILITY OPERATIONS OVERVIEW TABLE */}
      <div className="card">
        <div className="flex-between mb-4">
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Madurai District Facility Operations Overview</h3>
            <p className="text-xs text-muted">Real-time capacity, queue lengths, and predicted congestion risks</p>
          </div>
          <button
            className="btn btn-outline btn-sm flex-align"
            onClick={() => setActiveTab && setActiveTab('facilities')}
          >
            Manage Facilities <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-container">
          <table className="table text-sm">
            <thead>
              <tr>
                <th>Facility Name</th>
                <th>Type</th>
                <th>Capacity Load</th>
                <th>Queue</th>
                <th>Est. Wait</th>
                <th>Risk Level</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {maduraiCentres.map(c => {
                const totalCap = c.totalCapacity || 1000;
                const remaining = c.capacityRemaining !== undefined ? c.capacityRemaining : totalCap;
                const utilPct = totalCap > 0 ? Math.min(100, Math.round(((totalCap - remaining) / totalCap) * 100)) : 0;
                const isOperating = (c.status || c.operatingStatus || 'Operating') === 'Operating';

                return (
                  <tr key={c.id}>
                    <td>
                      <strong className="text-slate-800">{c.name}</strong>
                      <div className="text-xs text-muted">{c.city || c.district}</div>
                    </td>
                    <td className="text-xs">{c.type}</td>
                    <td>
                      <div style={{ minWidth: '120px' }}>
                        <div className="flex-between text-xs mb-1">
                          <span className="font-semibold">{utilPct}%</span>
                          <span className="text-muted">{remaining.toLocaleString('en-IN')} kg left</span>
                        </div>
                        <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${utilPct}%`,
                            height: '100%',
                            backgroundColor: utilPct >= 90 ? 'var(--danger)' : utilPct >= 65 ? 'var(--accent)' : 'var(--secondary)'
                          }} />
                        </div>
                      </div>
                    </td>
                    <td>{c.type === 'Godown' ? '—' : `${c.queueLength || 0} farmers`}</td>
                    <td>{c.type === 'Godown' ? '—' : `${c.waitTime || 30} mins`}</td>
                    <td>
                      <span className={`badge text-xs ${
                        c.riskLevel === 'High' ? 'badge-danger' :
                        c.riskLevel === 'Medium' ? 'badge-warning' : 'badge-success'
                      }`}>
                        {c.riskLevel || 'Low'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge text-xs ${isOperating ? 'badge-success' : 'badge-neutral'}`}>
                        {isOperating ? 'Operating' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
