import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { TAMIL_NADU_DISTRICTS, SUPPORTED_CROPS } from '../../constants/procurementConstants';
import {
  TrendingUp,
  CheckCircle,
  ShieldAlert,
  ArrowRight,
  Filter
} from 'lucide-react';

export default function CapacityAndForecast() {
  const { centres, requests, approveRedistribution } = useProcurement();

  const [activeView, setActiveView] = useState('overview'); // 'overview' | 'comparison'
  const [selectedDistrict, setSelectedDistrict] = useState('Madurai');
  const [selectedCrop, setSelectedCrop] = useState('Paddy');
  const [showGodowns, setShowGodowns] = useState(false);

  // Overload evaluation
  const scoredCentres = centres
    .filter(c => c.type !== 'Godown' && (c.status === 'Operating' || c.operatingStatus === 'Operating'))
    .map(c => {
      const cap = c.capacityQuintals || Math.round((c.totalCapacity || 1000) / 100);
      const expected = c.currentExpectedQuintals || 0;
      const excess = Math.max(0, expected - cap);
      const scheduledCount = requests.filter(r => r.centreId === c.id && ['Scheduled', 'Arrived', 'Quality Check', 'Weighing', 'Processing'].includes(r.status)).length;
      return { ...c, _cap: cap, _expected: expected, _excess: excess, _scheduledCount: scheduledCount };
    })
    .sort((a, b) => b._excess - a._excess || b._scheduledCount - a._scheduledCount);

  const overloadedCentre = scoredCentres[0];

  const targetCentre = overloadedCentre ? (
    centres.find(c =>
      c.id !== overloadedCentre.id &&
      c.district === overloadedCentre.district &&
      c.type !== 'Godown' &&
      (c.status === 'Operating' || c.operatingStatus === 'Operating') &&
      c.capacityRemaining > 0
    ) || centres.find(c =>
      c.id !== overloadedCentre.id &&
      c.type !== 'Godown' &&
      (c.status === 'Operating' || c.operatingStatus === 'Operating')
    )
  ) : null;

  const isActuallyOverloaded = overloadedCentre && (overloadedCentre._excess > 0 || overloadedCentre.riskLevel === 'High');
  const isApproved = overloadedCentre?.overloadApproved;

  // Comparison filtered facilities
  const districtCentres = centres.filter(c => c.district === selectedDistrict);
  const displayCentres = showGodowns ? districtCentres : districtCentres.filter(c => c.type !== 'Godown');

  return (
    <div>
      {/* Top Banner */}
      <div className="page-header flex-between">
        <div>
          <h2 className="page-title">Capacity Monitoring &amp; Demand Forecasting</h2>
          <p className="page-subtitle">
            Track storage utilization, evaluate surge risks, and review AI-assisted load redistribution.
          </p>
        </div>

        <div className="flex-gap">
          <button
            className={`btn btn-sm ${activeView === 'overview' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveView('overview')}
          >
            <TrendingUp size={15} /> Capacity &amp; Overload
          </button>
          <button
            className={`btn btn-sm ${activeView === 'comparison' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveView('comparison')}
          >
            <Filter size={15} /> Facility Comparison
          </button>
        </div>
      </div>

      {/* VIEW 1: CAPACITY & OVERLOAD RISK + REDISTRIBUTION */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          
          {/* AI Decision Support Redistribution Alert */}
          {overloadedCentre && (
            <div
              className="card"
              style={{
                borderLeft: `4px solid ${isActuallyOverloaded ? 'var(--danger)' : 'var(--accent)'}`,
                backgroundColor: isActuallyOverloaded ? '#fffdfd' : '#ffffff'
              }}
            >
              <div className="flex-between mb-3 pb-2 border-b">
                <div className="flex-align">
                  <ShieldAlert size={18} className={isActuallyOverloaded ? 'text-red-600' : 'text-amber-600'} />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginLeft: '8px' }}>
                    {isActuallyOverloaded ? 'Capacity Overload Risk Detected' : 'District Demand Surge Monitoring'}
                  </h3>
                </div>

                <span className={`badge text-xs ${isActuallyOverloaded ? 'badge-danger' : 'badge-warning'}`}>
                  {overloadedCentre.district} District
                </span>
              </div>

              <div className="grid-2col mb-4 text-sm">
                <div>
                  <div className="text-muted text-xs uppercase font-bold mb-1">CONGESTED FACILITY</div>
                  <h4 className="font-bold text-slate-800 text-base">{overloadedCentre.name}</h4>
                  <div className="text-muted text-xs mt-1">
                    Current Load: <strong>{overloadedCentre.currentExpectedQuintals || 1250} q</strong> / {overloadedCentre.capacityQuintals || 1000} q capacity
                  </div>
                  <div className="text-red-600 font-bold text-xs mt-1">
                    Status: {Math.round(((overloadedCentre.currentExpectedQuintals || 1250) / (overloadedCentre.capacityQuintals || 1000)) * 100)}% Expected Utilization (High Risk)
                  </div>
                </div>

                {targetCentre && (
                  <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '16px' }}>
                    <div className="text-muted text-xs uppercase font-bold mb-1">RECOMMENDED ALTERNATIVE YARD</div>
                    <h4 className="font-bold text-slate-800 text-base">{targetCentre.name}</h4>
                    <div className="text-muted text-xs mt-1">
                      Available Storage: <strong>{(targetCentre.capacityRemaining || 2500).toLocaleString('en-IN')} kg</strong>
                    </div>
                    <div className="text-green-700 font-bold text-xs mt-1">
                      Status: Normal Traffic (~{targetCentre.waitTime || 30} mins queue wait)
                    </div>
                  </div>
                )}
              </div>

              {/* Recommendation Action Bar */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex-between" style={{ alignItems: 'center' }}>
                <div className="text-xs text-slate-700">
                  <span className="font-bold">Recommendation:</span> Rebalance incoming farmer arrivals from {overloadedCentre.name} to {targetCentre?.name || 'an alternative yard'}. The officer retains final authority.
                </div>

                {isApproved ? (
                  <span className="badge badge-success text-xs flex-align">
                    <CheckCircle size={14} /> Redistribution Approved
                  </span>
                ) : (
                  <button
                    className="btn btn-secondary btn-sm flex-align"
                    onClick={() => {
                      if (targetCentre) {
                        approveRedistribution(overloadedCentre.id, targetCentre.id);
                        alert(`Redistribution approved! New filings in ${overloadedCentre.district} will prioritize ${targetCentre.name}.`);
                      }
                    }}
                  >
                    Approve Load Redistribution <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Facility Storage Utilization Cards */}
          <div>
            <div className="flex-between mb-3">
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Procurement Facility Storage Capacities</h3>
              <span className="text-xs text-muted">Real-time remaining space across all centers</span>
            </div>

            <div className="grid-3col">
              {centres.map(c => {
                const totalCap = c.totalCapacity || 1000;
                const remaining = c.capacityRemaining !== undefined ? c.capacityRemaining : totalCap;
                const used = Math.max(0, totalCap - remaining);
                const utilPct = totalCap > 0 ? Math.min(100, Math.round((used / totalCap) * 100)) : 0;
                const risk = utilPct >= 90 ? 'High' : utilPct >= 65 ? 'Medium' : 'Low';
                const isOperating = (c.status || c.operatingStatus || 'Operating') === 'Operating';

                return (
                  <div key={c.id} className="card text-sm">
                    <div className="flex-between mb-2">
                      <strong className="text-slate-800">{c.name}</strong>
                      <div className="flex-gap">
                        <span className={`badge text-xs ${isOperating ? 'badge-success' : 'badge-neutral'}`}>
                          {isOperating ? 'Operating' : 'Inactive'}
                        </span>
                        <span className={`badge text-xs ${
                          risk === 'High' ? 'badge-danger' :
                          risk === 'Medium' ? 'badge-warning' : 'badge-info'
                        }`}>
                          {risk} Risk
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-muted mb-3">{c.district} • {c.type}</div>

                    <div className="space-y-1 text-xs mb-3">
                      <div className="flex-between">
                        <span className="text-muted">Total Capacity:</span>
                        <span className="font-semibold">{totalCap.toLocaleString('en-IN')} kg</span>
                      </div>
                      <div className="flex-between">
                        <span className="text-muted">Remaining Space:</span>
                        <span className="font-bold text-green-700">{remaining.toLocaleString('en-IN')} kg</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex-between text-xs mb-1">
                        <span className="text-muted">Utilization:</span>
                        <span className="font-bold">{utilPct}%</span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${utilPct}%`,
                          height: '100%',
                          backgroundColor: risk === 'High' ? 'var(--danger)' : risk === 'Medium' ? 'var(--accent)' : 'var(--secondary)'
                        }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: FACILITY COMPARISON MATRIX */}
      {activeView === 'comparison' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="card p-3 flex-between flex-wrap" style={{ gap: '12px' }}>
            <div className="flex-gap flex-wrap">
              <div>
                <select
                  className="form-select text-xs font-semibold"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                  {TAMIL_NADU_DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  className="form-select text-xs font-semibold"
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                >
                  {SUPPORTED_CROPS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <label className="flex-align text-xs font-semibold text-slate-700" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showGodowns}
                  onChange={(e) => setShowGodowns(e.target.checked)}
                  style={{ marginRight: '6px' }}
                />
                Include Storage Godowns
              </label>
            </div>

            <span className="text-xs text-muted">
              Showing {displayCentres.length} facilities in {selectedDistrict}
            </span>
          </div>

          {/* Comparison Table */}
          <div className="card">
            <div className="table-container">
              <table className="table text-sm">
                <thead>
                  <tr>
                    <th>Facility Name</th>
                    <th>Type</th>
                    <th>Supported Crops</th>
                    <th>Queue</th>
                    <th>Remaining Capacity</th>
                    <th>Estimated Wait</th>
                    <th>Congestion Risk</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayCentres.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center text-muted py-6">
                        No facilities found for selected filters in {selectedDistrict}.
                      </td>
                    </tr>
                  ) : (
                    displayCentres.map(c => {
                      const isOperating = (c.status || c.operatingStatus || 'Operating') === 'Operating';
                      const supportsCrop = c.cropsSupported && c.cropsSupported.includes(selectedCrop);
                      const isProcurement = c.type !== 'Godown';

                      return (
                        <tr key={c.id}>
                          <td>
                            <strong>{c.name}</strong>
                            <div className="text-xs text-muted">{c.location}</div>
                          </td>
                          <td className="text-xs">{c.type}</td>
                          <td className="text-xs">
                            <span className={supportsCrop ? 'font-bold text-green-800' : 'text-muted'}>
                              {c.cropsSupported ? c.cropsSupported.join(', ') : 'None'}
                            </span>
                          </td>
                          <td>{isProcurement ? `${c.queueLength || 0} trucks` : '—'}</td>
                          <td>
                            <strong className="text-slate-800">
                              {(c.capacityRemaining || 0).toLocaleString('en-IN')} kg
                            </strong>
                          </td>
                          <td>{isProcurement ? `${c.waitTime || 30} mins` : '—'}</td>
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
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
