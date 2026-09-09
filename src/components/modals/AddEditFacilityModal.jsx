import React, { useState, useEffect } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { TAMIL_NADU_DISTRICTS, SUPPORTED_CROPS, FACILITY_TYPES } from '../../constants/procurementConstants';
import { X, Building2, AlertTriangle } from 'lucide-react';

export default function AddEditFacilityModal({ show, onClose, facilityToEdit = null }) {
  const { addFacility, updateFacility } = useProcurement();

  const [formData, setFormData] = useState({
    state: 'Tamil Nadu',
    district: 'Madurai',
    city: 'Madurai',
    facilityNumber: '',
    facilityName: '',
    facilityType: 'Procurement Centre',
    cropsSupported: ['Paddy'],
    totalCapacity: '2000',
    capacityUnit: 'Quintals',
    status: 'Operating'
  });

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (facilityToEdit) {
      setFormData({
        state: facilityToEdit.state || 'Tamil Nadu',
        district: facilityToEdit.district || 'Madurai',
        city: facilityToEdit.city || facilityToEdit.district || 'Madurai',
        facilityNumber: facilityToEdit.facilityNumber || '',
        facilityName: facilityToEdit.name || facilityToEdit.facilityName || '',
        facilityType: facilityToEdit.type || facilityToEdit.facilityType || 'Procurement Centre',
        cropsSupported: facilityToEdit.cropsSupported || ['Paddy'],
        totalCapacity: String(facilityToEdit.capacityQuintals || facilityToEdit.totalCapacity || 2000),
        capacityUnit: facilityToEdit.capacityUnit || 'Quintals',
        status: facilityToEdit.status || facilityToEdit.operatingStatus || 'Operating'
      });
    } else {
      setFormData({
        state: 'Tamil Nadu',
        district: 'Madurai',
        city: 'Madurai',
        facilityNumber: '',
        facilityName: '',
        facilityType: 'Procurement Centre',
        cropsSupported: ['Paddy'],
        totalCapacity: '2000',
        capacityUnit: 'Quintals',
        status: 'Operating'
      });
    }
    setErrorMessage('');
  }, [facilityToEdit, show]);

  if (!show) return null;

  const handleCropToggle = (crop) => {
    setFormData(prev => {
      const exists = prev.cropsSupported.includes(crop);
      const updated = exists 
        ? prev.cropsSupported.filter(c => c !== crop) 
        : [...prev.cropsSupported, crop];
      return { ...prev, cropsSupported: updated };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation checks
    if (!formData.district) {
      setErrorMessage('Please select a district.');
      return;
    }
    if (!formData.city || !formData.city.trim()) {
      setErrorMessage('Please enter a City or Town.');
      return;
    }
    if (!formData.facilityNumber || !formData.facilityNumber.trim()) {
      setErrorMessage('Please enter a Godown Number / Facility ID.');
      return;
    }
    if (!formData.facilityName || !formData.facilityName.trim()) {
      setErrorMessage('Please enter a Godown / Facility Name.');
      return;
    }
    if (!formData.cropsSupported || formData.cropsSupported.length === 0) {
      setErrorMessage('Please select at least one crop supported.');
      return;
    }
    if (!formData.totalCapacity || Number(formData.totalCapacity) <= 0) {
      setErrorMessage('Capacity must be greater than zero.');
      return;
    }

    if (facilityToEdit) {
      const result = updateFacility(facilityToEdit.id, formData);
      if (!result.success) {
        setErrorMessage(result.error || 'Failed to update facility.');
        return;
      }
    } else {
      const result = addFacility(formData);
      if (!result.success) {
        setErrorMessage(result.error || 'Failed to create facility.');
        return;
      }
    }

    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: '650px', width: '90%' }}>
        <div className="modal-header flex-between">
          <h3 className="modal-title flex-align">
            <Building2 size={20} className="text-amber-600" />
            {facilityToEdit ? 'EDIT PROCUREMENT FACILITY' : 'CREATE NEW GODOWN / FACILITY'}
          </h3>
          <button className="btn btn-outline btn-xs" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body space-y-4">
          {errorMessage && (
            <div className="alert alert-danger text-xs flex-align" style={{ padding: '8px 12px' }}>
              <AlertTriangle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">State</label>
              <input type="text" className="form-input text-slate-500 font-medium" value="Tamil Nadu" disabled />
            </div>

            <div className="form-group">
              <label className="form-label">District</label>
              <select 
                className="form-select"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                required
              >
                {TAMIL_NADU_DISTRICTS.map(dist => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">City / Town</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="e.g. Madurai Central, Vadipatti"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Godown Number / Facility ID (Unique)</label>
              <input 
                type="text" 
                className="form-input font-mono font-semibold"
                placeholder="e.g. MDU-GD-001"
                value={formData.facilityNumber}
                onChange={(e) => setFormData({ ...formData, facilityNumber: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Godown / Facility Name</label>
            <input 
              type="text" 
              className="form-input"
              placeholder="e.g. Madurai Central Procurement Facility"
              value={formData.facilityName}
              onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Facility Type</label>
              <select 
                className="form-select"
                value={formData.facilityType}
                onChange={(e) => setFormData({ ...formData, facilityType: e.target.value })}
              >
                {FACILITY_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Operating Status</label>
              <select 
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Operating">Operating</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Types of Crops That Can Be Held</label>
            <div className="flex-gap flex-wrap p-3 border rounded bg-slate-50">
              {SUPPORTED_CROPS.map(crop => {
                const checked = formData.cropsSupported.includes(crop);
                return (
                  <label key={crop} className="flex-align text-xs font-medium" style={{ cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={checked}
                      onChange={() => handleCropToggle(crop)}
                      style={{ marginRight: '4px' }}
                    />
                    {crop}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Total Storage / Procurement Capacity</label>
              <input 
                type="number" 
                className="form-input"
                placeholder="e.g. 2000"
                value={formData.totalCapacity}
                onChange={(e) => setFormData({ ...formData, totalCapacity: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Capacity Unit</label>
              <select 
                className="form-select"
                value={formData.capacityUnit}
                onChange={(e) => setFormData({ ...formData, capacityUnit: e.target.value })}
              >
                <option value="Quintals">Quintals (q)</option>
                <option value="kg">Kilograms (kg)</option>
              </select>
            </div>
          </div>

          <div className="modal-footer flex-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-secondary">
              {facilityToEdit ? 'Update Facility' : 'Create Facility'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
