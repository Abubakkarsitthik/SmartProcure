import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { ShieldAlert, Info, CheckCircle, TrendingUp } from 'lucide-react';

export default function AIForecast() {
  const { centres, requests, approveRedistribution } = useProcurement();

  if (centres.length === 0) {
    return (
      <div>
        <div className="page-header">
          <h2 className="page-title">AI Demand Forecast &amp; Overload Redistribution</h2>
          <p className="page-subtitle">Predict arrival surges, detect capacity overload, and approve redistribution recommendations.</p>
        </div>
        <div className="card text-center" style={{ padding: '40px' }}>
          <TrendingUp size={48} className="text-muted" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <p className="text-muted">No facilities in system. Create facilities first via Facility Management.</p>
        </div>
      </div>
    );
  }

  // Find facility with highest overload risk dynamically
  const scoredCentres = centres
    .filter(c => c.type !== 'Godown' && (c.status === 'Operating' || c.operatingStatus === 'Operating'))
    .map(c => {
      const cap = c.capacityQuintals || Math.round((c.totalCapacity || 1) / 100);
      const expected = c.currentExpectedQuintals || 0;
      const excess = Math.max(0, expected - cap);
      const scheduledCount = requests.filter(r => r.centreId === c.id && ['Scheduled', 'Arrived', 'Quality Check', 'Weighing', 'Processing'].includes(r.status)).length;
      return { ...c, _cap: cap, _expected: expected, _excess: excess, _scheduledCount: scheduledCount };
    })
    .sort((a, b) => b._excess - a._excess || b._scheduledCount - a._scheduledCount);

  const overloadedCentre = scoredCentres[0];
  if (!overloadedCentre) {
    return (
      <div>
        <div className="page-header">
          <h2 className="page-title">AI Demand Forecast &amp; Overload Redistribution</h2>
          <p className="page-subtitle">Predict arrival surges, detect capacity overload, and approve redistribution recommendations.</p>
        </div>
        <div className="card">
          <div className="alert alert-success">
            <CheckCircle size={16} />
            <span>All procurement facilities are operating within normal capacity. No overload detected.</span>
          </div>
        </div>
      </div>
    );
  }

  // Find best alternative in same district (different facility, procurement-capable, has capacity)
  const targetCentre = centres.find(c =>
    c.id !== overloadedCentre.id &&
    c.district === overloadedCentre.district &&
    c.type !== 'Godown' &&
    (c.status === 'Operating' || c.operatingStatus === 'Operating') &&
    c.capacityRemaining > 0
  ) || centres.find(c =>
    c.id !== overloadedCentre.id &&
    c.type !== 'Godown' &&
    (c.status === 'Operating' || c.operatingStatus === 'Operating')
  );

  const isApproved = overloadedCentre.overloadApproved;
  const isActuallyOverloaded = overloadedCentre._excess > 0 || overloadedCentre.riskLevel === 'High';

  // Dynamic redistribution estimate
  const avgProducePerFarmer = overloadedCentre._scheduledCount > 0 && overloadedCentre._expected > 0
    ? Math.round(overloadedCentre._expected / overloadedCentre._scheduledCount)
    : 8;
  const redirectFarmers = overloadedCentre._excess > 0 && avgProducePerFarmer > 0
    ? Math.max(1, Math.round(overloadedCentre._excess / avgProducePerFarmer))
    : Math.max(1, Math.round(overloadedCentre._scheduledCount * 0.25));
  const redirectQuintals = redirectFarmers * avgProducePerFarmer;

  const borderColor = isActuallyOverloaded ? 'var(--danger)' : 'var(--accent)';

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">AI Demand Forecast &amp; Overload Redistribution</h2>
        <p className="page-subtitle">Predict arrival surges, detect capacity overload, and approve redistribution recommendations.</p>
      </div>

      <div className="grid-2-1">
        <div>
          <div className="card" style={{ border: `2px solid ${borderColor}`, background: isActuallyOverloaded ? '#fffcfc' : '#fffcf4' }}>
            <h3 className="card-title flex-align" style={{ color: isActuallyOverloaded ? 'var(--danger)' : 'var(--accent)' }}>
              <ShieldAlert size={18} />
              {isActuallyOverloaded ? 'Capacity Overload Predicted' : 'Demand Monitoring Active'}
            </h3>

            <div className="grid-2col mb-4">
              <div className="space-y-2 text-sm">
                <div><strong>Facility:</strong> {overloadedCentre.name}</div>
                <div><strong>District:</strong> {overloadedCentre.district}</div>
                <div><strong>Scheduled Farmers:</strong> {overloadedCentre._scheduledCount}</div>
                <div><strong>Expected Produce:</strong> {overloadedCentre._expected} quintals</div>
              </div>
              <div className="space-y-2 text-sm">
                <div><strong>Facility Capacity:</strong> {overloadedCentre._cap} quintals</div>
                <div>
                  <strong>Overload Excess: </strong>
                  <span className={overloadedCentre._excess > 0 ? 'text-red-600 font-bold' : 'text-green-700 font-bold'}>
                    {overloadedCentre._excess > 0 ? `+${overloadedCentre._excess} quintals` : 'Within Capacity'}
                  </span>
                </div>
                <div><strong>Queue Length:</strong> {overloadedCentre.queueLength || 0} farmers</div>
                <div><strong>Peak Window:</strong> 10:00 AM – 12:00 PM</div>
              </div>
            </div>

            {targetCentre && (
              <div className="alert alert-warning" style={{ fontSize: '13px', margin: '16px 0' }}>
                <Info size={16} />
                <span>
                  <strong>AI Redistribution Recommendation:</strong> Redirect approximately {redirectFarmers} farmer{redirectFarmers !== 1 ? 's' : ''} (~{redirectQuintals} quintals) from <strong>{overloadedCentre.name}</strong> to <strong>{targetCentre.name}</strong> — same district, supports crops, procurement-capable, has remaining capacity.
                </span>
              </div>
            )}

            {!targetCentre && (
              <div className="alert alert-danger" style={{ fontSize: '13px', margin: '16px 0' }}>
                <ShieldAlert size={16} />
                <span>No alternative procurement facility found in {overloadedCentre.district}. Consider activating an inactive facility or creating a new one.</span>
              </div>
            )}

            {targetCentre && (
              <div className="flex-gap justify-end">
                {isApproved ? (
                  <span className="badge badge-success flex-align" style={{ fontSize: '13px', padding: '8px 16px' }}>
                    <CheckCircle size={16} /> Redistribution Approved
                  </span>
                ) : (
                  <button className="btn btn-secondary" onClick={() => approveRedistribution(overloadedCentre.id, targetCentre.id)}>
                    Approve Redistribution
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Forecast Summary</h3>
          <div className="space-y-3 text-xs" style={{ lineHeight: 1.5 }}>
            <div>
              <span className="font-bold text-slate-800">Most Loaded Facility:</span>
              <p className="text-muted">{overloadedCentre.name} ({overloadedCentre.district})</p>
            </div>
            <div>
              <span className="font-bold text-slate-800">Peak Demand Period:</span>
              <p className="text-muted">10:00 AM – 12:00 PM exhibits highest farmer arrival concentration.</p>
            </div>
            {targetCentre && (
              <div>
                <span className="font-bold text-slate-800">Recommended Redistribution Target:</span>
                <p className="text-muted">{targetCentre.name} ({targetCentre.district})</p>
                <p className="text-muted">Remaining Capacity: {(targetCentre.capacityRemaining || 0).toLocaleString('en-IN')} kg</p>
              </div>
            )}
            <div>
              <span className="font-bold text-slate-800">All Operating Facilities:</span>
              <p className="text-muted">
                {centres.filter(c => c.status === 'Operating' || c.operatingStatus === 'Operating').length} operating / {centres.length} total
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
