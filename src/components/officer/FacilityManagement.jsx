import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { TAMIL_NADU_DISTRICTS, SUPPORTED_CROPS, FACILITY_TYPES } from '../../constants/procurementConstants';
import AddEditFacilityModal from '../modals/AddEditFacilityModal';
import ExcelImportModal from '../modals/ExcelImportModal';
import FacilityDetailsModal from '../modals/FacilityDetailsModal';
import { Plus, FileSpreadsheet, Search, Eye, Edit2, Power } from 'lucide-react';

export default function FacilityManagement() {
  const { centres, toggleFacilityStatus } = useProcurement();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modal triggers state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [facilityToEdit, setFacilityToEdit] = useState(null);

  const [showImportModal, setShowImportModal] = useState(false);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFacilityDetails, setSelectedFacilityDetails] = useState(null);

  // Filter facilities
  const filteredFacilities = centres.filter(c => {
    // Search matching: facilityNumber, name, city
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      const matchNo = (c.facilityNumber || c.id || '').toLowerCase().includes(term);
      const matchName = (c.name || '').toLowerCase().includes(term);
      const matchCity = (c.city || c.location || '').toLowerCase().includes(term);
      if (!matchNo && !matchName && !matchCity) return false;
    }

    if (selectedDistrict !== 'All' && c.district !== selectedDistrict) return false;
    if (selectedType !== 'All' && c.type !== selectedType) return false;
    if (selectedCrop !== 'All' && c.cropsSupported && !c.cropsSupported.includes(selectedCrop)) return false;
    
    const currentStatus = c.status || c.operatingStatus || 'Operating';
    if (selectedStatus !== 'All' && currentStatus !== selectedStatus) return false;

    return true;
  });

  const handleOpenAddModal = () => {
    setFacilityToEdit(null);
    setShowAddEditModal(true);
  };

  const handleOpenEditModal = (fac) => {
    setFacilityToEdit(fac);
    setShowAddEditModal(true);
  };

  const handleOpenDetailsModal = (fac) => {
    setSelectedFacilityDetails(fac);
    setShowDetailsModal(true);
  };

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h2 className="page-title">Procurement Facility & Godown Master Management</h2>
          <p className="page-subtitle">Create, edit, activate/deactivate, and Excel-import government procurement facilities across Tamil Nadu.</p>
        </div>

        <div className="flex-gap">
          <button className="btn btn-outline btn-sm flex-align" onClick={() => setShowImportModal(true)}>
            <FileSpreadsheet size={16} /> IMPORT FROM EXCEL
          </button>
          <button className="btn btn-secondary btn-sm flex-align" onClick={handleOpenAddModal}>
            <Plus size={16} /> ADD FACILITY
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card mb-4" style={{ padding: '16px' }}>
        <div className="grid-5col flex-align flex-wrap" style={{ gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
            <Search size={16} className="text-muted" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input 
              type="text" 
              className="form-input text-xs" 
              placeholder="Search No, Name, City..." 
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
              <option value="All">All Districts (Tamil Nadu)</option>
              {TAMIL_NADU_DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <select 
              className="form-select text-xs"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="All">All Facility Types</option>
              {FACILITY_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <select 
              className="form-select text-xs"
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
            >
              <option value="All">All Crops</option>
              {SUPPORTED_CROPS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <select 
              className="form-select text-xs font-semibold"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Operating">Operating</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Facilities Master Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Facility No</th>
              <th>Facility Name</th>
              <th>State / District / City</th>
              <th>Facility Type</th>
              <th>Crops Supported</th>
              <th>Total Capacity</th>
              <th>Available Capacity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFacilities.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center text-muted" style={{ padding: '30px' }}>
                  No facilities found matching search & filter criteria.
                </td>
              </tr>
            ) : (
              filteredFacilities.map(fac => {
                const totalCap = fac.totalCapacity || (fac.capacityQuintals ? fac.capacityQuintals * 100 : 200000);
                const remainingCap = fac.capacityRemaining !== undefined ? fac.capacityRemaining : totalCap;
                const unit = fac.capacityUnit || 'Quintals';
                const isOperating = (fac.status === 'Operating' || fac.operatingStatus === 'Operating');

                return (
                  <tr key={fac.id} style={{ opacity: isOperating ? 1 : 0.65 }}>
                    <td><strong className="font-mono text-xs">{fac.facilityNumber || fac.id}</strong></td>
                    <td>
                      <strong>{fac.name || fac.facilityName}</strong>
                      <div className="text-xs text-muted">{fac.location}</div>
                    </td>
                    <td>
                      <div className="text-xs">
                        <span className="font-bold text-slate-700">{fac.district}</span>
                        <div className="text-muted">{fac.city || fac.district}</div>
                      </div>
                    </td>
                    <td><span className="badge badge-neutral text-xs">{fac.type}</span></td>
                    <td>
                      <div className="text-xs font-semibold text-slate-700">
                        {fac.cropsSupported ? fac.cropsSupported.join(', ') : 'Paddy'}
                      </div>
                    </td>
                    <td>
                      <span className="text-xs font-semibold">
                        {unit === 'Quintals' ? `${Math.round(totalCap / 100)} q` : `${totalCap.toLocaleString('en-IN')} kg`}
                      </span>
                    </td>
                    <td>
                      <span className={`text-xs font-bold ${remainingCap > 0 ? 'text-green-700' : 'text-red-600'}`}>
                        {unit === 'Quintals' ? `${Math.round(remainingCap / 100)} q` : `${remainingCap.toLocaleString('en-IN')} kg`}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${isOperating ? 'badge-success' : 'badge-danger'} text-xs`}>
                        {isOperating ? 'Operating' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="flex-gap">
                        <button className="btn btn-outline btn-xs flex-align" onClick={() => handleOpenDetailsModal(fac)} title="View Details">
                          <Eye size={12} /> VIEW
                        </button>
                        <button className="btn btn-outline btn-xs flex-align text-amber-700" onClick={() => handleOpenEditModal(fac)} title="Edit Facility">
                          <Edit2 size={12} /> EDIT
                        </button>
                        <button 
                          className={`btn btn-xs flex-align ${isOperating ? 'btn-danger' : 'btn-secondary'}`}
                          onClick={() => toggleFacilityStatus(fac.id)}
                          title={isOperating ? 'Deactivate Facility' : 'Activate Facility'}
                        >
                          <Power size={12} /> {isOperating ? 'DEACTIVATE' : 'ACTIVATE'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <AddEditFacilityModal 
        show={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        facilityToEdit={facilityToEdit}
      />

      <ExcelImportModal 
        show={showImportModal}
        onClose={() => setShowImportModal(false)}
      />

      <FacilityDetailsModal 
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        facility={selectedFacilityDetails}
      />
    </div>
  );
}
