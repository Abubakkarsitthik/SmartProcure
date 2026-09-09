import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  Users,
  Scale,
  RefreshCw,
  CheckCircle,
  Printer
} from 'lucide-react';

const MSP_RATES = {
  'Paddy': 22,
  'Wheat': 24,
  'Maize': 18,
  'Pulses': 55,
  'Sugarcane': 3.5,
  'Cotton': 65
};

export default function QueueAndYard() {
  const {
    queueItems,
    requests,
    currentServingToken,
    advanceQueue,
    updateProcurementStage,
    completeProcurement,
    updatePaymentStatus
  } = useProcurement();

  const [activeSubTab, setActiveSubTab] = useState('live-queue'); // 'live-queue' | 'processing' | 'completed'

  // Processing & Weighing state
  const activeProcessingRequests = requests.filter(r =>
    ['Scheduled', 'Arrived', 'Quality Check', 'Weighing', 'Processing'].includes(r.status)
  );

  const completedRequests = requests.filter(r => r.status === 'Completed');

  const [selectedReqId, setSelectedReqId] = useState(
    activeProcessingRequests.length > 0 ? activeProcessingRequests[0].id : null
  );

  const activeReq = requests.find(r => r.id === selectedReqId) || activeProcessingRequests[0];
  const [actualQty, setActualQty] = useState(activeReq?.quantity ? String(activeReq.quantity) : '');

  const mspRate = activeReq ? (MSP_RATES[activeReq.crop] || 22) : 22;
  const parsedQty = Number(actualQty) || 0;
  const totalPayout = parsedQty * mspRate;

  const handleSelectWeighingRequest = (req) => {
    setSelectedReqId(req.id);
    setActualQty(String(req.quantity || ''));
    setActiveSubTab('processing');
  };

  const handleCompleteWeighing = () => {
    if (!activeReq) return;
    if (parsedQty <= 0) {
      alert('Please enter a valid measured net weight in kilograms.');
      return;
    }
    completeProcurement(activeReq.id, parsedQty, totalPayout);
    alert(`Procurement completed for ${activeReq.farmerName} (Token #${activeReq.tokenNumber || '—'}). Receipt generated!`);
    setActiveSubTab('completed');
  };

  return (
    <div>
      {/* Top Banner with Counter Control */}
      <div className="page-header flex-between">
        <div>
          <h2 className="page-title">Queue Management &amp; Processing Yard</h2>
          <p className="page-subtitle">
            Gate check-in, token progression, weighing scale readings, and digital receipt generation.
          </p>
        </div>

        <div className="flex-gap">
          <button
            className="btn btn-secondary btn-sm flex-align"
            onClick={() => advanceQueue()}
            title="Advance the main display gate counter"
          >
            <RefreshCw size={14} /> Call Next Token (#{currentServingToken + 1})
          </button>
        </div>
      </div>

      {/* Primary Sub-navigation Tabs */}
      <div className="flex-gap mb-6 border-b pb-1" style={{ borderColor: 'var(--border)' }}>
        <button
          className={`btn btn-sm ${activeSubTab === 'live-queue' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSubTab('live-queue')}
        >
          <Users size={16} /> Live Queue ({queueItems.filter(q => q.status !== 'Completed').length})
        </button>
        <button
          className={`btn btn-sm ${activeSubTab === 'processing' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSubTab('processing')}
        >
          <Scale size={16} /> Processing &amp; Weighing ({activeProcessingRequests.length})
        </button>
        <button
          className={`btn btn-sm ${activeSubTab === 'completed' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSubTab('completed')}
        >
          <CheckCircle size={16} /> Completed Today ({completedRequests.length})
        </button>
      </div>

      {/* TAB 1: LIVE QUEUE & ARRIVALS */}
      {activeSubTab === 'live-queue' && (
        <div className="grid-3col" style={{ gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
          <div className="card">
            <h3 className="card-title mb-3">Facility Entry Gate Queue</h3>

            <div className="table-container">
              <table className="table text-sm">
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Farmer Name</th>
                    <th>Crop &amp; Quantity</th>
                    <th>Stage Status</th>
                    <th>Yard Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queueItems.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-6">
                        No active queue entries.
                      </td>
                    </tr>
                  ) : (
                    queueItems.map(item => {
                      const isNowServing = parseInt(item.token, 10) === currentServingToken;
                      return (
                        <tr
                          key={item.token}
                          style={{ backgroundColor: isNowServing ? '#f0fdf4' : 'transparent' }}
                        >
                          <td>
                            <span className="font-mono font-bold text-slate-800">
                              #{item.token}
                            </span>
                            {isNowServing && (
                              <span className="badge badge-success text-xs ml-2">Now Serving</span>
                            )}
                          </td>
                          <td>
                            <strong>{item.farmerName}</strong>
                            <div className="text-xs text-muted">ID: {item.requestId}</div>
                          </td>
                          <td>
                            {item.crop} ({item.quantity} kg)
                          </td>
                          <td>
                            <span className={`badge text-xs ${
                              item.status === 'Completed' ? 'badge-success' :
                              item.status === 'Arrived' ? 'badge-info' :
                              item.status === 'Processing' ? 'badge-warning' : 'badge-neutral'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td>
                            <div className="flex-gap">
                              {item.status === 'Scheduled' && (
                                <button
                                  className="btn btn-outline btn-xs text-green-700"
                                  onClick={() => updateProcurementStage(item.requestId, 'Arrived')}
                                >
                                  Mark Arrived
                                </button>
                              )}
                              {item.status === 'Arrived' && (
                                <button
                                  className="btn btn-secondary btn-xs"
                                  onClick={() => updateProcurementStage(item.requestId, 'Quality Check')}
                                >
                                  Start Quality Check
                                </button>
                              )}
                              {['Processing', 'Quality Check', 'Weighing'].includes(item.status) && (
                                <button
                                  className="btn btn-primary btn-xs"
                                  onClick={() => {
                                    const r = requests.find(x => x.id === item.requestId);
                                    if (r) handleSelectWeighingRequest(r);
                                  }}
                                >
                                  Weigh &amp; Complete
                                </button>
                              )}
                              {item.status === 'Completed' && (
                                <span className="text-xs text-muted">Procured ✓</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Queue Statistics Card */}
          <div className="card">
            <h3 className="card-title text-sm font-semibold text-muted mb-3">Counter Status</h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded bg-green-50 border border-green-200">
                <span className="text-xs text-green-800 font-medium block">Current Serving Token</span>
                <span style={{ fontSize: '26px', fontWeight: 600, color: 'var(--primary)' }}>
                  #{currentServingToken}
                </span>
              </div>

              <div className="flex-between">
                <span className="text-muted">Next in Line:</span>
                <span className="font-mono font-bold">#{currentServingToken + 1}</span>
              </div>
              <div className="flex-between">
                <span className="text-muted">Waiting Farmers:</span>
                <span className="font-bold text-slate-800">
                  {queueItems.filter(q => q.status !== 'Completed').length}
                </span>
              </div>
              <div className="flex-between">
                <span className="text-muted">Estimated Scale Wait:</span>
                <span className="font-semibold text-green-700">~8 mins / truck</span>
              </div>

              <div className="pt-3 border-t text-xs text-muted">
                Advancing the token notifies waiting farmers on their mobile live queue tracker.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROCESSING & WEIGHING SCALE STATION */}
      {activeSubTab === 'processing' && (
        <div>
          {activeProcessingRequests.length === 0 ? (
            <div className="card text-center py-10">
              <Scale size={40} className="text-muted" style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <h4 style={{ fontSize: '16px', fontWeight: 600 }}>No Active Farmers in Processing Yard</h4>
              <p className="text-xs text-muted mb-4">
                Mark arrived farmers in the Live Queue tab to start weighing and quality checks.
              </p>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setActiveSubTab('live-queue')}
              >
                Go to Live Queue
              </button>
            </div>
          ) : (
            <div className="grid-3col" style={{ gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
              
              {/* Main Weighing Scale Form */}
              <div className="card">
                <div className="flex-between mb-4 pb-2 border-b">
                  <div>
                    <span className="text-xs text-muted font-semibold font-mono">
                      TOKEN #{activeReq?.tokenNumber || '—'} • {activeReq?.id}
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--primary)' }}>
                      Electronic Weighing Scale
                    </h3>
                  </div>

                  <span className="badge badge-warning text-xs">
                    {activeReq?.status || 'Processing'}
                  </span>
                </div>

                {/* Farmer & Crop Details */}
                <div className="grid-3col text-sm mb-6 p-3 rounded bg-slate-50 border">
                  <div>
                    <span className="text-xs text-muted block uppercase font-bold">Farmer Name</span>
                    <span className="font-semibold text-slate-800">{activeReq?.farmerName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted block uppercase font-bold">Produce Crop</span>
                    <span className="font-semibold text-slate-800">{activeReq?.crop} ({activeReq?.variety})</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted block uppercase font-bold">Declared Weight</span>
                    <span className="font-semibold text-slate-800">{activeReq?.quantity} kg</span>
                  </div>
                </div>

                {/* Scale Measurement Input */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="form-label font-bold text-sm">
                      Actual Weighed Net Weight (kg)
                    </label>
                    <input
                      type="number"
                      className="form-input text-lg font-bold text-slate-800"
                      value={actualQty}
                      onChange={(e) => setActualQty(e.target.value)}
                      placeholder="Enter net measured weight..."
                    />
                    <span className="text-xs text-muted">
                      Calibrated digital weighbridge reading.
                    </span>
                  </div>

                  {/* Financial Calculation Box */}
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex-between text-sm mb-2">
                      <span className="text-muted">Government MSP Rate:</span>
                      <span className="font-bold">₹{mspRate} / kg</span>
                    </div>
                    <div className="flex-between text-sm mb-2">
                      <span className="text-muted">Measured Quantity:</span>
                      <span className="font-bold">{parsedQty.toLocaleString('en-IN')} kg</span>
                    </div>
                    <div className="flex-between border-t border-green-300 pt-2 text-base">
                      <span className="font-semibold text-green-900">Total Calculated MSP Payout:</span>
                      <span className="font-bold text-xl text-green-900">
                        ₹{totalPayout.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Weighing Receipt */}
                <div className="flex-between border-t pt-4">
                  <div className="text-xs text-muted">
                    Finalizes quantity and forwards to the Direct Benefit Transfer (DBT) gateway.
                  </div>

                  <button
                    className="btn btn-primary flex-align"
                    onClick={handleCompleteWeighing}
                  >
                    <CheckCircle size={16} /> Complete Procurement &amp; Issue Receipt
                  </button>
                </div>
              </div>

              {/* Selector for other farmers in yard */}
              <div className="card">
                <h4 className="text-xs font-bold uppercase text-muted mb-3">
                  Other Farmers in Yard ({activeProcessingRequests.length})
                </h4>

                <div className="space-y-2">
                  {activeProcessingRequests.map(r => (
                    <button
                      key={r.id}
                      className="w-full text-left p-2 rounded border text-xs block"
                      style={{
                        borderColor: r.id === activeReq?.id ? 'var(--primary)' : 'var(--border)',
                        backgroundColor: r.id === activeReq?.id ? 'var(--bg-main)' : 'white',
                        borderWidth: r.id === activeReq?.id ? '2px' : '1px'
                      }}
                      onClick={() => handleSelectWeighingRequest(r)}
                    >
                      <div className="flex-between font-bold">
                        <span>Token #{r.tokenNumber || '—'}</span>
                        <span className="badge badge-warning text-xs">{r.status}</span>
                      </div>
                      <div className="text-slate-800 font-semibold mt-1">{r.farmerName}</div>
                      <div className="text-muted">{r.crop} • {r.quantity} kg</div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* TAB 3: COMPLETED TODAY */}
      {activeSubTab === 'completed' && (
        <div className="card">
          <div className="flex-between mb-4">
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Procured Harvest Receipts &amp; DBT Disbursements</h3>
              <p className="text-xs text-muted">Official electronic scale receipts generated today</p>
            </div>
          </div>

          <div className="table-container">
            <table className="table text-sm">
              <thead>
                <tr>
                  <th>Receipt Ref</th>
                  <th>Farmer Name</th>
                  <th>Crop</th>
                  <th>Weighed Qty</th>
                  <th>Procured Value</th>
                  <th>DBT Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {completedRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-6">
                      No completed procurements yet today.
                    </td>
                  </tr>
                ) : (
                  completedRequests.map(r => (
                    <tr key={r.id}>
                      <td>
                        <strong className="font-mono text-slate-800">{r.referenceNumber || `PROC-2026-${r.tokenNumber || '001'}`}</strong>
                        <div className="text-xs text-muted">Req: {r.id}</div>
                      </td>
                      <td>{r.farmerName}</td>
                      <td>{r.crop}</td>
                      <td><strong>{r.actualQuantity || r.quantity} kg</strong></td>
                      <td className="font-bold text-slate-800">
                        ₹{(r.procurementAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className={`badge text-xs ${
                          r.paymentStatus === 'PAYMENT COMPLETED' ? 'badge-success' : 'badge-warning'
                        }`}>
                          {r.paymentStatus || 'PAYMENT PENDING'}
                        </span>
                      </td>
                      <td>
                        <div className="flex-gap">
                          {r.paymentStatus !== 'PAYMENT COMPLETED' && (
                            <button
                              className="btn btn-outline btn-xs text-green-700"
                              onClick={() => updatePaymentStatus(r.id, 'PAYMENT COMPLETED')}
                            >
                              Confirm DBT
                            </button>
                          )}
                          <button
                            className="btn btn-outline btn-xs flex-align"
                            onClick={() => alert(`Receipt print view for ${r.referenceNumber}`)}
                          >
                            <Printer size={12} /> Receipt
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
