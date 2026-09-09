import React from 'react';
import { X, RotateCcw } from 'lucide-react';

export default function ResetModal({ show, onClose, onConfirm }) {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header flex-between">
          <span className="modal-title flex-align">
            <RotateCcw size={16} style={{ marginRight: '6px', color: 'var(--accent)' }} />
            Reset Application Data
          </span>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <p className="text-sm">
            Are you sure you want to reset all application data to initial defaults?
          </p>
          <p className="text-sm text-muted mt-2">
            All procurement requests, approvals, queue tokens, payment updates, imported facilities, and created facilities will be restored to the default configuration.
          </p>
        </div>
        <div className="modal-footer flex-between">
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-danger btn-sm flex-align" onClick={onConfirm}>
            <RotateCcw size={14} /> Reset Application Data
          </button>
        </div>
      </div>
    </div>
  );
}
