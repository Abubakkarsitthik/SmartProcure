import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function SupportModal({ show, onClose, mobile }) {
  const [queryText, setQueryText] = useState('');

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Your procurement query has been logged. A district coordinator will contact you shortly.');
    setQueryText('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Contact Procurement Support</span>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Farmer Registered Mobile</label>
              <input type="text" className="form-input text-slate-500" value={mobile || '9876543210'} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Describe your query</label>
              <textarea 
                className="form-textarea" 
                placeholder="Describe your procurement query..." 
                rows="3" 
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                required
              ></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
