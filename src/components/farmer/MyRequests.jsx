import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  Calendar,
  CheckCircle,
  FileText,
  CreditCard,
  Scale,
  RefreshCw,
  Printer,
  Users
} from 'lucide-react';

const STAGES = [
  { key: 'Submitted', label: 'Submitted' },
  { key: 'Approved', label: 'Approved' },
  { key: 'Centre Assigned', label: 'Centre Assigned' },
  { key: 'Scheduled', label: 'Scheduled' },
  { key: 'Arrived', label: 'Arrived' },
  { key: 'Inspection', label: 'Inspection' },
  { key: 'Weighing', label: 'Weighing' },
  { key: 'Processing', label: 'Processing' },
  { key: 'Completed', label: 'Completed' }
];

const getStageIndex = (status) => {
  switch (status) {
    case 'Pending Officer Approval': return 0;
    case 'Approved': return 1;
    case 'Centre Assigned': return 2;
    case 'Scheduled': return 3;
    case 'Arrived': return 4;
    case 'Quality Check': return 5;
    case 'Weighing': return 6;
    case 'Processing': return 7;
    case 'Completed': return 8;
    default: return 0;
  }
};

export default function MyRequests({ initialSelectedRequest }) {
  const {
    currentUser,
    requests,
    currentServingToken,
    calculateFarmersAhead,
    calculateEstimatedWait,
    refreshQueue
  } = useProcurement();

  const farmerRequests = requests.filter(r => r.farmerId === currentUser?.id);
  const [selectedRequestId, setSelectedRequestId] = useState(
    initialSelectedRequest?.id || (farmerRequests.length > 0 ? farmerRequests[0].id : null)
  );

  const selectedRequest = requests.find(r => r.id === selectedRequestId);

  const currentStageIdx = selectedRequest ? getStageIndex(selectedRequest.status) : 0;
  const tokenNum = selectedRequest?.tokenNumber;
  const queueAhead = tokenNum ? calculateFarmersAhead(tokenNum) : 0;
  const estimatedWaitMins = tokenNum ? calculateEstimatedWait(tokenNum, selectedRequest?.centreId) : 0;

  const isScheduledOrBeyond = selectedRequest && [
    'Scheduled', 'Arrived', 'Quality Check', 'Weighing', 'Processing', 'Completed'
  ].includes(selectedRequest.status);

  const isYardActive = selectedRequest && [
    'Arrived', 'Quality Check', 'Weighing', 'Processing'
  ].includes(selectedRequest.status);

  const isCompleted = selectedRequest?.status === 'Completed';

  return (
    <div>
      {/* View Header */}
      <div className="page-header flex-between">
        <div>
          <h2 className="page-title">My Procurement Requests</h2>
          <p className="page-subtitle">
            Track produce filings, facility allocations, appointments, inspection, and DBT payments.
          </p>
        </div>
      </div>

      {/* Main Container: Split or Full Details View */}
      {farmerRequests.length === 0 ? (
        <div className="card text-center py-10">
          <FileText size={40} className="text-muted" style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>No Procurement Requests Found</h3>
          <p className="text-muted text-sm mb-4">
            You haven't submitted any produce filings yet. Register your crop harvest to get started.
          </p>
        </div>
      ) : (
        <div className="grid-3col" style={{ gridTemplateColumns: '320px 1fr', alignItems: 'start', gap: '20px' }}>
          
          {/* Left Column: Request List Sidebar */}
          <div className="card" style={{ padding: '16px' }}>
            <div className="text-xs font-semibold text-muted mb-3 flex-between">
              <span>Your Filings ({farmerRequests.length})</span>
            </div>

            <div className="space-y-2">
              {farmerRequests.map(req => {
                const isSelected = req.id === selectedRequestId;
                return (
                  <button
                    key={req.id}
                    onClick={() => setSelectedRequestId(req.id)}
                    className="w-full text-left p-3 rounded-lg border transition-all block"
                    style={{
                      backgroundColor: isSelected ? 'var(--bg-main)' : '#ffffff',
                      borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                      borderWidth: isSelected ? '2px' : '1px'
                    }}
                  >
                    <div className="flex-between mb-1">
                      <span className="font-mono font-bold text-xs">{req.id}</span>
                      <span className={`badge text-xs ${
                        req.status === 'Completed' ? 'badge-success' :
                        req.status === 'Pending Officer Approval' ? 'badge-warning' :
                        req.status === 'Rejected' ? 'badge-danger' : 'badge-info'
                      }`}>
                        {req.status === 'Pending Officer Approval' ? 'Pending' : req.status}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-slate-800">
                      {req.crop} ({req.quantity} {req.unit || 'kg'})
                    </div>

                    <div className="text-xs text-muted mt-1 flex-between">
                      <span>{req.centreName ? req.centreName.split(' ')[0] + ' Yard' : 'Awaiting Centre'}</span>
                      {req.tokenNumber && <span className="font-mono font-bold text-amber-700">#{req.tokenNumber}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Unified Request Details View */}
          {selectedRequest ? (
            <div className="space-y-4">
              
              {/* Request Summary Top Card */}
              <div className="card">
                <div className="flex-between mb-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div className="flex-align text-xs text-muted mb-1">
                      <span className="font-mono font-bold text-slate-800">{selectedRequest.id}</span>
                      <span className="mx-2">•</span>
                      <span>Filed on {selectedRequest.readinessDate || 'Today'}</span>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--primary)' }}>
                      {selectedRequest.crop} — {selectedRequest.quantity} {selectedRequest.unit || 'kg'}
                    </h3>
                  </div>

                  <span className={`badge ${
                    selectedRequest.status === 'Completed' ? 'badge-success' :
                    selectedRequest.status === 'Pending Officer Approval' ? 'badge-warning' :
                    selectedRequest.status === 'Rejected' ? 'badge-danger' : 'badge-info'
                  }`}>
                    {selectedRequest.status}
                  </span>
                </div>

                {/* Grid of Key Properties */}
                <div className="grid-3col text-sm mb-4">
                  <div>
                    <span className="text-xs text-muted block font-medium">Crop &amp; Variety</span>
                    <span className="font-semibold text-slate-800">{selectedRequest.crop} ({selectedRequest.variety || 'Standard'})</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted block font-medium">Location</span>
                    <span className="font-semibold text-slate-800">{selectedRequest.village || 'Vadipatti'}, {selectedRequest.district || 'Madurai'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted block font-medium">Assigned Facility</span>
                    <span className="font-semibold text-slate-800">{selectedRequest.centreName || 'Awaiting Officer Allocation'}</span>
                  </div>
                </div>

                {/* Progress Stepper Timeline */}
                <div className="pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="text-xs font-semibold text-muted mb-4">Procurement Progress</div>
                  
                  <div className="timeline-stepper" style={{ marginBottom: '10px' }}>
                    <div
                      className="timeline-progress-bar"
                      style={{
                        width: `${Math.min(100, Math.round((currentStageIdx / (STAGES.length - 1)) * 100))}%`
                      }}
                    />

                    {STAGES.map((stg, i) => {
                      const isPast = i < currentStageIdx;
                      const isCurrent = i === currentStageIdx;
                      return (
                        <div
                          key={stg.key}
                          className={`timeline-step ${isPast ? 'completed' : isCurrent ? 'active' : ''}`}
                        >
                          <div className="step-node">
                            {isPast ? '✓' : i + 1}
                          </div>
                          <span className="step-label" style={{ fontWeight: isCurrent ? 700 : 400 }}>
                            {stg.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* CONTEXTUAL MODULE 1: GATE PASS TOKEN TICKET (Only when Scheduled or beyond) */}
              {isScheduledOrBeyond && (
                <div className="card" style={{ borderLeft: '4px solid var(--secondary)' }}>
                  <div className="flex-between mb-3">
                    <div className="flex-align">
                      <Calendar size={18} className="text-green-700" />
                      <h4 style={{ fontSize: '16px', fontWeight: 600, marginLeft: '8px' }}>
                        Gate Entry Pass
                      </h4>
                    </div>
                    <button
                      className="btn btn-outline btn-sm flex-align"
                      onClick={() => alert(`Printing gate pass for Token #${selectedRequest.tokenNumber}`)}
                    >
                      <Printer size={13} /> Print Pass
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 grid-3col text-sm">
                    <div>
                      <span className="text-xs text-muted block font-medium">Gate Token Number</span>
                      <span className="font-mono text-xl font-bold text-amber-700">
                        #{selectedRequest.tokenNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted block font-medium">Reporting Facility</span>
                      <span className="font-semibold text-slate-800">{selectedRequest.centreName}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted block font-medium">Appointment Slot</span>
                      <span className="font-semibold text-slate-800">
                        {selectedRequest.appointmentDate} • {selectedRequest.appointmentSlot || 'Morning Slot'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTEXTUAL MODULE 2: LIVE QUEUE STATUS (When Scheduled or at Yard) */}
              {isScheduledOrBeyond && !isCompleted && (
                <div className="card">
                  <div className="flex-between mb-3">
                    <div className="flex-align">
                      <Users size={18} className="text-amber-600" />
                      <h4 style={{ fontSize: '16px', fontWeight: 600, marginLeft: '8px' }}>
                        Live Yard Queue Tracker
                      </h4>
                    </div>
                    <button
                      className="btn btn-outline btn-sm flex-align"
                      onClick={() => refreshQueue()}
                    >
                      <RefreshCw size={12} /> Refresh
                    </button>
                  </div>

                  <div className="grid-3col text-center p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <div>
                      <span className="text-xs text-muted block font-medium">Now Serving</span>
                      <span style={{ fontSize: '22px', fontWeight: 600, color: 'var(--primary)' }}>
                        #{currentServingToken}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted block font-medium">Farmers Ahead</span>
                      <span style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-main)' }}>
                        {queueAhead}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted block font-medium">Estimated Wait</span>
                      <span style={{ fontSize: '22px', fontWeight: 600, color: 'var(--secondary)' }}>
                        {estimatedWaitMins} mins
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTEXTUAL MODULE 3: INSPECTION & WEIGHING (When Yard is Active or Complete) */}
              {(isYardActive || isCompleted) && (
                <div className="card">
                  <div className="flex-align mb-3">
                    <Scale size={18} className="text-primary" />
                    <h4 style={{ fontSize: '16px', fontWeight: 600, marginLeft: '8px' }}>
                      Inspection &amp; Weighing Verification
                    </h4>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex-between p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-muted">Moisture &amp; Quality Check:</span>
                      <span className="font-semibold text-green-700 flex-align">
                        <CheckCircle size={14} /> Passed Standard MSP Grade
                      </span>
                    </div>

                    <div className="flex-between p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-muted">Electronic Weighed Net Weight:</span>
                      <span className="font-bold text-slate-800">
                        {selectedRequest.actualQuantity || selectedRequest.quantity} kg
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTEXTUAL MODULE 4: DBT PAYMENT RECONCILIATION (When Completed) */}
              {isCompleted && (
                <div className="card" style={{ borderLeft: '4px solid var(--secondary)', background: '#fcfdfc' }}>
                  <div className="flex-between mb-3">
                    <div className="flex-align">
                      <CreditCard size={18} className="text-green-700" />
                      <h4 style={{ fontSize: '16px', fontWeight: 600, marginLeft: '8px' }}>
                        DBT Direct Bank Transfer
                      </h4>
                    </div>
                    <span className={`badge ${
                      selectedRequest.paymentStatus === 'PAYMENT COMPLETED' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {selectedRequest.paymentStatus || 'PAYMENT IN PROGRESS'}
                    </span>
                  </div>

                  <div className="grid-3col text-sm mb-3">
                    <div>
                      <span className="text-xs text-muted block font-medium">Total MSP Amount</span>
                      <span style={{ fontSize: '22px', fontWeight: 600, color: 'var(--primary)' }}>
                        ₹{(selectedRequest.procurementAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted block font-medium">Receipt Reference</span>
                      <span className="font-mono font-bold text-slate-800">
                        {selectedRequest.referenceNumber || 'PROC-2026-00157'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted block font-medium">Beneficiary Account</span>
                      <span className="font-semibold text-slate-800">Aadhaar Linked (SBI)</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted bg-white p-2 rounded border border-slate-200">
                    Direct Benefit Transfer initiated to the farmer's bank account authenticated through UIDAI Aadhaar Payment Bridge.
                  </div>
                </div>
              )}

            </div>
          ) : null}

        </div>
      )}
    </div>
  );
}
