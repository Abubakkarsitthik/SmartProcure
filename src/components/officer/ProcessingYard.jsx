import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Scale, CreditCard, ChevronDown, ChevronUp, Users } from 'lucide-react';

const MSP_RATES = {
  'Paddy': 22,
  'Wheat': 24,
  'Maize': 18,
  'Pulses': 55,
  'Sugarcane': 3.5,
  'Cotton': 65
};

export default function ProcessingYard({ setActiveTab }) {
  const {
    requests,
    updateProcurementStage,
    completeProcurement,
    updatePaymentStatus
  } = useProcurement();

  // All active processing requests
  const activeRequests = requests.filter(r =>
    ['Scheduled', 'Arrived', 'Quality Check', 'Weighing', 'Processing'].includes(r.status)
  );

  // Requests completed but payment pending
  const completedPendingPayment = requests.filter(r =>
    r.status === 'Completed' && r.paymentStatus !== 'PAYMENT COMPLETED'
  );

  // The request being weighed (currently selected)
  const [selectedReqId, setSelectedReqId] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const activeProcessingReq = selectedReqId
    ? activeRequests.find(r => r.id === selectedReqId)
    : activeRequests[0];

  const [actualQty, setActualQty] = useState('');

  const pricePerKg = activeProcessingReq
    ? (MSP_RATES[activeProcessingReq.crop] || 22)
    : 22;

  const parsedQty = Number(actualQty) || 0;
  const calculatedTotalAmount = parsedQty * pricePerKg;

  const completedReq = completedPendingPayment[0] || requests.find(r => r.status === 'Completed');

  if (activeRequests.length === 0 && !completedReq) {
    return (
      <div>
        <div className="page-header">
          <h2 className="page-title">Procurement Processing &amp; Scale Station</h2>
          <p className="page-subtitle">Weigh crop produce, complete digital procurement receipt, and initiate DBT payment.</p>
        </div>
        <div className="card text-center" style={{ padding: '40px' }}>
          <Scale size={48} className="text-muted" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3>No Active Farmers in Processing Yard</h3>
          <p className="text-muted text-sm mb-4">Go to Queue Management to mark a farmer Arrived or start processing.</p>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('queues')}>
            GO TO QUEUE MANAGEMENT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Procurement Processing &amp; Scale Station</h2>
        <p className="page-subtitle">Weigh crop produce, complete digital procurement receipt, and initiate DBT payment.</p>
      </div>

      {/* Queue list selector if multiple active */}
      {activeRequests.length > 1 && (
        <div className="card mb-4" style={{ padding: '12px' }}>
          <h4 className="text-xs font-bold uppercase text-muted mb-2 flex-align">
            <Users size={14} style={{ marginRight: '4px' }} /> Active Farmers in Processing Queue ({activeRequests.length})
          </h4>
          <div className="flex-gap flex-wrap">
            {activeRequests.map(r => (
              <button
                key={r.id}
                className={`btn btn-xs ${(activeProcessingReq?.id === r.id) ? 'btn-secondary' : 'btn-outline'}`}
                onClick={() => {
                  setSelectedReqId(r.id);
                  setActualQty(String(r.quantity || ''));
                }}
              >
                Token #{r.tokenNumber || '—'} | {r.farmerName}
                <span className="ml-1 badge badge-warning text-xs">{r.status}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid-2-1">
        {activeProcessingReq ? (
          <div className="card">
            <div className="flex-between mb-4" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <div>
                <span className="text-xs text-muted block">Active token processing</span>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--primary)' }}>
                  {activeProcessingReq.farmerName} (Token #{activeProcessingReq.tokenNumber || '—'})
                </h3>
                <span className="text-xs text-muted">{activeProcessingReq.centreName} | {activeProcessingReq.crop}</span>
              </div>
              <span className="badge badge-warning">{activeProcessingReq.status}</span>
            </div>

            <div className="flex-gap mb-6 flex-wrap">
              <button
                className={`btn btn-sm ${activeProcessingReq.status === 'Arrived' ? 'btn-secondary' : 'btn-outline'}`}
                onClick={() => updateProcurementStage(activeProcessingReq.id, 'Quality Check')}
              >
                Quality Check
              </button>
              <button
                className={`btn btn-sm ${activeProcessingReq.status === 'Quality Check' ? 'btn-secondary' : 'btn-outline'}`}
                disabled={activeProcessingReq.status === 'Arrived'}
                onClick={() => updateProcurementStage(activeProcessingReq.id, 'Weighing')}
              >
                Weighing Scale
              </button>
              <button
                className={`btn btn-sm ${activeProcessingReq.status === 'Weighing' ? 'btn-secondary' : 'btn-outline'}`}
                disabled={['Arrived', 'Quality Check'].includes(activeProcessingReq.status)}
                onClick={() => updateProcurementStage(activeProcessingReq.id, 'Processing')}
              >
                Receipt Processing
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!actualQty || Number(actualQty) <= 0) {
                alert('Please input actual measured crop weight.');
                return;
              }
              completeProcurement(activeProcessingReq.id, actualQty, calculatedTotalAmount);
              setActualQty('');
              setSelectedReqId(null);
            }}>
              <h4 className="font-bold text-sm mb-3">Scale Weighing Log Details</h4>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Declared Quantity (kg)</label>
                  <input type="text" className="form-input text-slate-500" value={`${activeProcessingReq.quantity} kg`} disabled />
                </div>

                <div className="form-group">
                  <label className="form-label">Actual Quantity Weighed (kg)</label>
                  <input
                    type="number"
                    className="form-input font-bold text-slate-800"
                    value={actualQty}
                    placeholder={`e.g. ${activeProcessingReq.quantity}`}
                    onChange={(e) => setActualQty(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Government MSP Rate (₹ per kg) — {activeProcessingReq.crop}</label>
                  <input type="text" className="form-input text-slate-500" value={`₹${pricePerKg} / kg`} disabled />
                </div>

                <div className="form-group">
                  <label className="form-label">Calculated Procurement Amount</label>
                  <input type="text" className="form-input text-slate-800 font-bold" value={parsedQty > 0 ? `₹${calculatedTotalAmount.toLocaleString('en-IN')}` : '—'} disabled />
                </div>
              </div>

              <div className="text-right">
                <button type="submit" className="btn btn-secondary">
                  COMPLETE PROCUREMENT
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="card text-center" style={{ padding: '30px' }}>
            <p>All scheduled active farmers in queue are processed.</p>
          </div>
        )}

        <div>
          <div className="card" style={{ height: 'fit-content' }}>
            <h3 className="card-title"><CreditCard size={18} /> Direct Benefit Transfer Payment</h3>

            {completedReq ? (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded border border-slate-100 text-xs space-y-1">
                  <div><strong>Request ID:</strong> {completedReq.id}</div>
                  <div><strong>Farmer:</strong> {completedReq.farmerName}</div>
                  <div><strong>Weighed Qty:</strong> {completedReq.actualQuantity || completedReq.quantity} kg</div>
                  <div><strong>Crop:</strong> {completedReq.crop}</div>
                  <div><strong>Amount:</strong> ₹{(completedReq.procurementAmount || 0).toLocaleString('en-IN')}</div>
                  <div className="font-mono"><strong>Ref ID:</strong> {completedReq.referenceNumber || '—'}</div>
                  <div className="font-semibold text-amber-700"><strong>Status:</strong> {completedReq.paymentStatus}</div>
                </div>

                <div className="flex-gap flex-col">
                  {completedReq.paymentStatus === 'PAYMENT PENDING' && (
                    <button
                      className="btn btn-secondary btn-block btn-sm"
                      onClick={() => updatePaymentStatus(completedReq.id, 'PAYMENT INITIATED')}
                    >
                      INITIATE PAYMENT
                    </button>
                  )}
                  {completedReq.paymentStatus === 'PAYMENT INITIATED' && (
                    <button
                      className="btn btn-primary btn-block btn-sm"
                      onClick={() => updatePaymentStatus(completedReq.id, 'PAYMENT COMPLETED')}
                    >
                      MARK PAYMENT COMPLETED
                    </button>
                  )}
                  {completedReq.paymentStatus === 'PAYMENT COMPLETED' && (
                    <span className="text-sm font-semibold text-green-600 text-center block">Payment Completed ✓</span>
                  )}
                </div>

                {/* Other completed pending payments */}
                {completedPendingPayment.length > 1 && (
                  <div>
                    <button
                      className="btn btn-outline btn-xs w-full flex-align justify-center mt-2"
                      onClick={() => setShowCompleted(!showCompleted)}
                    >
                      {showCompleted ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      {completedPendingPayment.length - 1} more completed awaiting payment
                    </button>
                    {showCompleted && completedPendingPayment.slice(1).map(r => (
                      <div key={r.id} className="p-2 border rounded text-xs mt-2 bg-slate-50">
                        <div><strong>{r.farmerName}</strong> | {r.id}</div>
                        <div className="text-muted">₹{(r.procurementAmount || 0).toLocaleString('en-IN')} | {r.paymentStatus}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted">Complete weighing and procurement to initiate payment updates.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
