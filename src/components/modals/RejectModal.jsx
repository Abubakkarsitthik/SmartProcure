import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function RejectModal({ show, onClose, onConfirm, requestId }) {
  const [rejectionReason, setRejectionReason] = useState('');

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rejectionReason) return;
    onConfirm(requestId, rejectionReason);
    setRejectionReason('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Reject Procurement Request ({requestId})</span>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Select Rejection Reason</label>
              <select 
                className="form-select"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              >
                <option value="">-- Choose Reason --</option>
                <option value="Produce moisture levels exceed maximum 17% limit.">Moisture content exceeds 17% limit</option>
                <option value="Foreign matter / impurities found in crop sample.">High impurity/chaff content</option>
                <option value="Harvest readiness date exceeds center closing timeline.">Harvest readiness exceeds timelines</option>
                <option value="Duplicate crop registration for the same season.">Duplicate farmer crop filing</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger btn-sm">
              Confirm Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
