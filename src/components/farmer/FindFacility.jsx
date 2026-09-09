import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { TAMIL_NADU_DISTRICTS, SUPPORTED_CROPS } from '../../constants/procurementConstants';
import { Search, Building2, Users, Clock, X } from 'lucide-react';

export default function FindFacility() {
  const { centres } = useProcurement();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('Madurai');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedFacilityDetails, setSelectedFacilityDetails] = useState(null);

  const filteredCentres = centres.filter(c => {
    if (selectedDistrict !== 'All' && c.district !== selectedDistrict) return false;
    if (selectedCrop !== 'All' && c.cropsSupported) {
      const match = c.cropsSupported.some(facCrop => {
        if (facCrop === selectedCrop) return true;
        const fLower = (facCrop || '').toLowerCase().trim();
        const cLower = (selectedCrop || '').toLowerCase().trim();
        if (fLower === cLower) return true;
        if (fLower === 'paddy' && cLower.includes('paddy')) return true;
        if (fLower === 'cotton' && cLower.includes('cotton')) return true;
        if (fLower === 'maize' && cLower.includes('maize')) return true;
        if (fLower === 'sugarcane' && cLower.includes('sugarcane')) return true;
        if (fLower === 'pulses' && (cLower.includes('gram') || cLower.includes('pulse') || cLower.includes('tur') || cLower.includes('urad') || cLower.includes('chickpea'))) return true;
        if (cLower.startsWith(fLower) || fLower.startsWith(cLower)) return true;
        return false;
      });
      if (!match) return false;
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = (c.name || '').toLowerCase().includes(term);
      const matchLoc = (c.location || '').toLowerCase().includes(term);
      if (!matchName && !matchLoc) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h2 className="page-title">Find Procurement Centres &amp; Godowns</h2>
          <p className="page-subtitle">
            Browse government procurement facilities across Tamil Nadu districts.
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card mb-6 p-4">
        <div className="grid-3col" style={{ gridTemplateColumns: '1.2fr 1fr 1fr', gap: '12px', alignItems: 'center' }}>
          
          <div style={{ position: 'relative' }}>
            <Search size={16} className="text-muted" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              className="form-input text-xs"
              placeholder="Search centre name or town..."
              style={{ paddingLeft: '32px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <select 
              className="form-select text-xs font-semibold"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              <option value="All">All Tamil Nadu Districts</option>
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
              <option value="All">All Crops</option>
              {SUPPORTED_CROPS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Facilities Grid */}
      {filteredCentres.length === 0 ? (
        <div className="card text-center py-10">
          <Building2 size={36} className="text-muted" style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <h4 style={{ fontSize: '16px', fontWeight: 600 }}>No facilities match your filters</h4>
          <p className="text-xs text-muted">Try selecting a different district or crop.</p>
        </div>
      ) : (
        <div className="grid-3col">
          {filteredCentres.map(c => {
            const isOperating = (c.status || c.operatingStatus || 'Operating') === 'Operating';
            const totalCap = c.totalCapacity || 1000;
            const remaining = c.capacityRemaining !== undefined ? c.capacityRemaining : totalCap;
            const usedPct = totalCap > 0 ? Math.min(100, Math.round(((totalCap - remaining) / totalCap) * 100)) : 0;
            const isProcurement = c.type !== 'Godown';

            return (
              <div key={c.id} className="card flex flex-col justify-between">
                <div>
                  <div className="flex-between mb-2">
                    <span className={`badge text-xs ${isOperating ? 'badge-success' : 'badge-neutral'}`}>
                      {isOperating ? 'Operating' : 'Inactive'}
                    </span>
                    <span className="text-xs text-muted font-medium">{c.district}</span>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px', color: 'var(--primary)' }}>
                    {c.name}
                  </h3>
                  <p className="text-xs text-muted mb-4">{c.location}</p>

                  <div className="space-y-2 text-xs mb-4">
                    <div>
                      <div className="flex-between mb-1">
                        <span className="text-muted">Capacity Load:</span>
                        <span className="font-bold text-slate-800">{usedPct}%</span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${usedPct}%`,
                          height: '100%',
                          backgroundColor: usedPct > 85 ? 'var(--danger)' : usedPct > 60 ? 'var(--accent)' : 'var(--secondary)'
                        }} />
                      </div>
                    </div>

                    {isProcurement && (
                      <div className="flex-between pt-1">
                        <span className="text-muted flex-align"><Users size={12} /> Active Queue:</span>
                        <span className="font-semibold text-slate-800">{c.queueLength || 0} farmers</span>
                      </div>
                    )}

                    {isProcurement && (
                      <div className="flex-between">
                        <span className="text-muted flex-align"><Clock size={12} /> Estimated Wait:</span>
                        <span className="font-semibold text-slate-800">{c.waitTime || 30} mins</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  className="btn btn-outline btn-sm w-full mt-2"
                  onClick={() => setSelectedFacilityDetails(c)}
                >
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Facility Details Drawer / Modal */}
      {selectedFacilityDetails && (
        <div className="modal-overlay" onClick={() => setSelectedFacilityDetails(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="flex-between mb-4 pb-2" style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <span className="text-xs text-muted font-medium">{selectedFacilityDetails.district} District</span>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--primary)' }}>
                  {selectedFacilityDetails.name}
                </h3>
              </div>
              <button
                className="btn btn-outline btn-xs"
                style={{ borderRadius: '50%', width: '28px', height: '28px', padding: 0 }}
                onClick={() => setSelectedFacilityDetails(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex-between">
                <span className="text-muted">Facility Type:</span>
                <span className="font-semibold">{selectedFacilityDetails.type}</span>
              </div>
              <div className="flex-between">
                <span className="text-muted">Operating Status:</span>
                <span className="badge badge-success text-xs">
                  {selectedFacilityDetails.status || 'Operating'}
                </span>
              </div>
              <div className="flex-between">
                <span className="text-muted">Crops Supported:</span>
                <span className="font-semibold text-slate-800">
                  {selectedFacilityDetails.cropsSupported ? selectedFacilityDetails.cropsSupported.join(', ') : 'All MSP Crops'}
                </span>
              </div>
              <div className="flex-between">
                <span className="text-muted">Total Yard Capacity:</span>
                <span className="font-semibold">
                  {(selectedFacilityDetails.totalCapacity || 1000).toLocaleString('en-IN')} kg
                </span>
              </div>
              <div className="flex-between">
                <span className="text-muted">Available Remaining:</span>
                <span className="font-bold text-green-700">
                  {(selectedFacilityDetails.capacityRemaining || 0).toLocaleString('en-IN')} kg
                </span>
              </div>
              <div className="flex-between">
                <span className="text-muted">Serving Counters:</span>
                <span className="font-semibold">{selectedFacilityDetails.counters || 2} Active Gates</span>
              </div>
              <div className="flex-between">
                <span className="text-muted">Weighing Rate:</span>
                <span className="font-semibold">{selectedFacilityDetails.processingRate || 8} mins / truck</span>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t text-right">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setSelectedFacilityDetails(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
