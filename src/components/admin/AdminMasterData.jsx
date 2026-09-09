import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { TAMIL_NADU_DISTRICTS, SUPPORTED_CROPS } from '../../constants/procurementConstants';
import { Database, Wheat, MapPin, Building2 } from 'lucide-react';

export default function AdminMasterData() {
  const { centres } = useProcurement();
  const [activeDataTab, setActiveDataTab] = useState('commodities');

  // Count facilities per district
  const districtFacilityCount = {};
  centres.forEach(c => {
    const d = c.district || 'Unknown';
    districtFacilityCount[d] = (districtFacilityCount[d] || 0) + 1;
  });

  // Crop category mapping
  const getCropCategory = (crop) => {
    const cl = crop.toLowerCase();
    if (cl.includes('paddy')) return 'Cereals';
    if (cl.includes('sorghum') || cl.includes('cumbu') || cl.includes('maize') || cl.includes('ragi')) return 'Cereals & Millets';
    if (cl.includes('gram') || cl.includes('pulse') || cl.includes('tur') || cl.includes('urad') || cl.includes('greengram') || cl.includes('redgram')) return 'Pulses';
    if (cl.includes('cotton')) return 'Fibre';
    if (cl.includes('groundnut') || cl.includes('sunflower') || cl.includes('soyabean') || cl.includes('sesamum')) return 'Oilseeds';
    if (cl.includes('sugarcane')) return 'Sugar Crops';
    if (cl.includes('copra') || cl.includes('coconut')) return 'Plantation';
    return 'Other';
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Master Data Management</h2>
        <p className="page-subtitle">Centralized system configuration data for SmartProcure.</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex-gap mb-4">
        <button
          className={`btn ${activeDataTab === 'commodities' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setActiveDataTab('commodities')}
        >
          <Wheat size={14} /> Commodities ({SUPPORTED_CROPS.length})
        </button>
        <button
          className={`btn ${activeDataTab === 'districts' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setActiveDataTab('districts')}
        >
          <MapPin size={14} /> Districts ({TAMIL_NADU_DISTRICTS.length})
        </button>
        <button
          className={`btn ${activeDataTab === 'facilities' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setActiveDataTab('facilities')}
        >
          <Building2 size={14} /> Facilities ({centres.length})
        </button>
      </div>

      {/* Commodities */}
      {activeDataTab === 'commodities' && (
        <div className="card">
          <h3 className="card-title"><Database size={18} className="text-amber-600" /> Official Procurement Commodities ({SUPPORTED_CROPS.length})</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Commodity Name</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {SUPPORTED_CROPS.map((crop, idx) => (
                  <tr key={crop}>
                    <td className="text-muted text-xs">{idx + 1}</td>
                    <td className="font-medium">{crop}</td>
                    <td><span className="badge badge-neutral text-xs">{getCropCategory(crop)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Districts */}
      {activeDataTab === 'districts' && (
        <div className="card">
          <h3 className="card-title"><MapPin size={18} className="text-green-600" /> Tamil Nadu Districts ({TAMIL_NADU_DISTRICTS.length})</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>District Name</th>
                  <th>Linked Facilities</th>
                </tr>
              </thead>
              <tbody>
                {TAMIL_NADU_DISTRICTS.map((dist, idx) => (
                  <tr key={dist}>
                    <td className="text-muted text-xs">{idx + 1}</td>
                    <td className="font-medium">{dist}</td>
                    <td>
                      <span className={`badge text-xs ${districtFacilityCount[dist] ? 'badge-success' : 'badge-neutral'}`}>
                        {districtFacilityCount[dist] || 0} facilities
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Facilities Overview */}
      {activeDataTab === 'facilities' && (
        <div className="card">
          <h3 className="card-title"><Building2 size={18} className="text-blue-600" /> Facility Master Overview ({centres.length})</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Facility ID</th>
                  <th>Name</th>
                  <th>District</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Capacity</th>
                  <th>Crops</th>
                </tr>
              </thead>
              <tbody>
                {centres.map(c => (
                  <tr key={c.id}>
                    <td className="font-mono font-semibold text-xs">{c.facilityNumber}</td>
                    <td className="font-medium text-xs">{c.name}</td>
                    <td>{c.district}</td>
                    <td><span className="badge badge-neutral text-xs">{c.type}</span></td>
                    <td>
                      <span className={`badge text-xs ${(c.status === 'Operating' || c.operatingStatus === 'Operating') ? 'badge-success' : 'badge-danger'}`}>
                        {c.status || c.operatingStatus}
                      </span>
                    </td>
                    <td className="text-xs">
                      {(c.capacityRemaining || 0).toLocaleString('en-IN')} / {(c.totalCapacity || 0).toLocaleString('en-IN')} kg
                    </td>
                    <td className="text-xs text-muted">{c.cropsSupported ? c.cropsSupported.length + ' types' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
