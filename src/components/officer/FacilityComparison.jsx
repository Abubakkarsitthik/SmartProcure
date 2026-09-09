import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { TAMIL_NADU_DISTRICTS, SUPPORTED_CROPS } from '../../constants/procurementConstants';

export default function FacilityComparison() {
  const { centres } = useProcurement();
  const [selectedDirectoryDistrict, setSelectedDirectoryDistrict] = useState('Madurai');
  const [selectedDirectoryCrop, setSelectedDirectoryCrop] = useState('Paddy');
  const [showGodowns, setShowGodowns] = useState(false);

  // Filter: district match
  const districtCentres = centres.filter(c => c.district === selectedDirectoryDistrict);

  // Separate procurement-capable from storage-only
  const procurementCentres = districtCentres.filter(c => c.type !== 'Godown');
  const godownsOnly = districtCentres.filter(c => c.type === 'Godown');

  const displayCentres = showGodowns ? districtCentres : procurementCentres;

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h2 className="page-title">Procurement Facility Comparison</h2>
          <p className="page-subtitle">Compare storage capacities, crop support, waiting times, and congestion risk levels across facilities.</p>
        </div>

        <div className="flex-gap flex-wrap">
          <select
            className="form-select font-bold"
            style={{ width: '180px' }}
            value={selectedDirectoryDistrict}
            onChange={(e) => setSelectedDirectoryDistrict(e.target.value)}
            aria-label="Select district"
          >
            {TAMIL_NADU_DISTRICTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            className="form-select font-semibold"
            style={{ width: '140px' }}
            value={selectedDirectoryCrop}
            onChange={(e) => setSelectedDirectoryCrop(e.target.value)}
            aria-label="Select crop"
          >
            {SUPPORTED_CROPS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <label className="flex-align text-xs font-semibold" style={{ cursor: 'pointer', gap: '4px' }}>
            <input
              type="checkbox"
              checked={showGodowns}
              onChange={(e) => setShowGodowns(e.target.checked)}
              style={{ marginRight: '4px' }}
            />
            Include Godowns
          </label>
        </div>
      </div>

      {districtCentres.length === 0 && (
        <div className="card text-center" style={{ padding: '30px' }}>
          <p className="text-muted text-sm">No facilities found for <strong>{selectedDirectoryDistrict}</strong> district. Create facilities via Facility Management.</p>
        </div>
      )}

      {districtCentres.length > 0 && (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Procurement Facility</th>
                  <th>Facility Type</th>
                  <th>Crop Support</th>
                  <th>Queue</th>
                  <th>Remaining Capacity</th>
                  <th>AI Wait Estimate</th>
                  <th>Congestion Risk</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {displayCentres.map(c => {
                  const supportsCrop = c.cropsSupported && c.cropsSupported.includes(selectedDirectoryCrop);
                  const isProcurementCapable = c.type !== 'Godown';
                  const predictedWait = isProcurementCapable && (c.counters || 0) > 0
                    ? Math.max(5, Math.round(((c.queueLength || 0) / (c.counters || 1)) * (c.processingRate || 8)))
                    : 0;
                  const isOperating = c.status === 'Operating' || c.operatingStatus === 'Operating';
                  const totalCap = c.totalCapacity || (c.capacityQuintals ? c.capacityQuintals * 100 : 1);
                  const utilPct = totalCap > 0 ? Math.round(((totalCap - (c.capacityRemaining || 0)) / totalCap) * 100) : 0;

                  return (
                    <tr
                      key={c.id}
                      style={{
                        backgroundColor: (supportsCrop && isProcurementCapable && isOperating) ? '#f0fdf4' : 'white',
                        opacity: isOperating ? 1 : 0.65
                      }}
                    >
                      <td>
                        <div>
                          <strong>{c.name}</strong>
                          <div className="text-xs text-muted">{c.city || c.district}</div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge text-xs ${c.type === 'Godown' ? 'badge-neutral' : 'badge-info'}`}>
                          {c.type}
                        </span>
                        {!isProcurementCapable && (
                          <div className="text-xs text-muted mt-1">Storage Only</div>
                        )}
                      </td>
                      <td>
                        <span className={supportsCrop ? 'font-bold text-green-700 text-xs' : 'text-muted text-xs'}>
                          {c.cropsSupported ? c.cropsSupported.join(', ') : 'None'}
                        </span>
                        {supportsCrop && isProcurementCapable && (
                          <div className="text-xs text-green-600 font-semibold">✓ Supports {selectedDirectoryCrop}</div>
                        )}
                      </td>
                      <td>
                        <span className="font-semibold text-xs">{c.queueLength || 0} farmers</span>
                      </td>
                      <td>
                        <div className="text-xs">
                          <div className="font-semibold">{(c.capacityRemaining || 0).toLocaleString('en-IN')} kg</div>
                          <div className="text-muted">{utilPct}% utilized</div>
                        </div>
                      </td>
                      <td>
                        {isProcurementCapable ? (
                          <span className={`font-bold text-xs ${predictedWait > 60 ? 'text-red-600' : predictedWait > 30 ? 'text-amber-600' : 'text-green-700'}`}>
                            {predictedWait} min
                          </span>
                        ) : (
                          <span className="text-muted text-xs">N/A</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge text-xs ${
                          c.riskLevel === 'High' ? 'badge-danger' :
                          c.riskLevel === 'Medium' ? 'badge-warning' :
                          c.riskLevel === 'Managed' ? 'badge-info' : 'badge-success'
                        }`}>
                          {c.riskLevel || 'Low'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge text-xs ${isOperating ? 'badge-success' : 'badge-danger'}`}>
                          {isOperating ? 'Operating' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {displayCentres.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center text-muted" style={{ padding: '20px' }}>
                      No procurement-capable facilities found. Toggle "Include Godowns" to see all facilities.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!showGodowns && godownsOnly.length > 0 && (
            <div className="text-xs text-muted mt-2 text-right">
              {godownsOnly.length} storage-only godown{godownsOnly.length !== 1 ? 's' : ''} hidden. Toggle "Include Godowns" to show.
            </div>
          )}
        </>
      )}
    </div>
  );
}
