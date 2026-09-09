import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Sparkles, ChevronRight, Scale } from 'lucide-react';

export default function FarmerRequestsReview({ onOpenRejectModal, setActiveTab }) {
  const {
    requests,
    getEligibleFacilities,
    approveRequest,
    assignCentre,
    assignSlotAndToken
  } = useProcurement();

  const [selectedRequest, setSelectedRequest] = useState(null);

  const sortedRequestsForOfficer = [...requests].sort((a, b) => {
    const statusPriority = {
      'Pending Officer Approval': 1,
      'Approved': 2,
      'Centre Assigned': 3,
      'Scheduled': 4,
      'Arrived': 5,
      'Quality Check': 6,
      'Weighing': 7,
      'Processing': 8,
      'Completed': 9,
      'Rejected': 10,
      'Cancelled': 11
    };
    return (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99);
  });

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Procurement Requests Review Pipeline</h2>
        <p className="page-subtitle">Review incoming produce filings, verify crop compatibility, confirm facility allocation, and assign time slots.</p>
      </div>

      {selectedRequest ? (
        <div className="card" style={{ borderColor: 'var(--primary)', borderWidth: '2px' }}>
          <div className="flex-between mb-4" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <div>
              <span className="text-xs text-muted block font-mono font-bold">Request ID: {selectedRequest.id}</span>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--primary)' }}>Review Produce Details</h3>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => setSelectedRequest(null)}>
              Back to Requests
            </button>
          </div>

          <div className="grid-2col mb-6">
            <div>
              <h4 className="text-xs text-muted font-semibold mb-2">Farmer Details</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Farmer Name:</strong> {selectedRequest.farmerName}</div>
                <div><strong>State:</strong> Tamil Nadu</div>
                <div><strong>District:</strong> {selectedRequest.district || 'Madurai'}</div>
                <div><strong>Village:</strong> {selectedRequest.village || 'Vadipatti'}</div>
              </div>
            </div>

            <div>
              <h4 className="text-xs text-muted font-semibold mb-2">Produce Details</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Crop Name:</strong> {selectedRequest.crop}</div>
                <div><strong>Variety:</strong> {selectedRequest.variety}</div>
                <div><strong>Declared Quantity:</strong> {selectedRequest.quantity} {selectedRequest.unit}</div>
                <div><strong>Harvest Readiness:</strong> {selectedRequest.readinessDate}</div>
              </div>
            </div>
          </div>

          {/* AI Assisted Centre suggestion box */}
          {selectedRequest.status === 'Pending Officer Approval' && (
            <div className="card ai-recommendation-card mb-4">
              <h4 className="text-amber-700 font-semibold text-sm mb-1 flex-align">
                <Sparkles size={16} /> AI-Assisted Centre Recommendation
              </h4>
              <p className="text-xs text-slate-700 font-semibold">
                Recommended Facility: {selectedRequest.aiRecommendedCentreName || 'Madurai Procurement Centre 03'}
              </p>
              <div className="text-xs text-muted mt-1">
                Reason: {selectedRequest.aiReason || `Recommended because facility supports ${selectedRequest.crop}, has remaining capacity, and lower predicted congestion.`}
              </div>
            </div>
          )}

          {/* Dynamic Workflow Actions */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <div className="flex-between mb-4">
              <div>
                <span className="text-xs text-muted">Current Request Status:</span>
                <span className="badge badge-warning ml-2">{selectedRequest.status}</span>
              </div>
            </div>

            {selectedRequest.status === 'Pending Officer Approval' && (
              <div className="flex-gap justify-end">
                <button 
                  className="btn btn-danger btn-sm" 
                  onClick={() => onOpenRejectModal(selectedRequest)}
                >
                  Reject Request
                </button>
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => {
                    approveRequest(selectedRequest.id);
                    setSelectedRequest(prev => ({ ...prev, status: 'Approved' }));
                  }}
                >
                  Approve Request
                </button>
              </div>
            )}

            {selectedRequest.status === 'Approved' && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Step 2: Confirm Eligible Facility for {selectedRequest.district || 'Madurai'}</h4>
                <div className="grid-3col">
                  {getEligibleFacilities(selectedRequest.district || 'Madurai', selectedRequest.crop, selectedRequest.quantity).map(fac => (
                    <div key={fac.id} className="p-3 border rounded-lg bg-slate-50 flex flex-col justify-between">
                      <div>
                        <div className="font-semibold text-sm">{fac.name}</div>
                        <div className="text-xs text-muted">{fac.type}</div>
                        <div className="text-xs mt-1">Queue: {fac.queueLength} | Est Wait: {fac.predictedWait}m</div>
                        <span className={`badge ${fac.capacityAvailable ? 'badge-success' : 'badge-danger'} text-xs mt-1`}>
                          {fac.capacityStatus}
                        </span>
                      </div>
                      <button 
                        className="btn btn-secondary btn-sm mt-3" 
                        disabled={!fac.capacityAvailable}
                        onClick={() => {
                          assignCentre(selectedRequest.id, fac.id);
                          setSelectedRequest(prev => ({ ...prev, status: 'Centre Assigned', centreId: fac.id, centreName: fac.name }));
                        }}
                      >
                        Confirm Centre
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedRequest.status === 'Centre Assigned' && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Step 3: Smart Slot Recommendation &amp; Token Generation</h4>
                <div className="table-container mb-3">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Time Slot</th>
                        <th>Booked Farmers</th>
                        <th>Predicted Wait</th>
                        <th>Availability / Demand</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { slot: '8:00 AM – 9:00 AM', label: '8–9 AM' },
                        { slot: '9:00 AM – 10:00 AM', label: '9–10 AM' },
                        { slot: '10:00 AM – 11:00 AM', label: '10–11 AM', recommended: true },
                        { slot: '11:00 AM – 12:00 PM', label: '11–12 PM' }
                      ].map(({ slot, label, recommended }) => {
                        const centre = requests.find(r => r.centreId === selectedRequest.centreId);
                        const bookedCount = requests.filter(r =>
                          r.centreId === selectedRequest.centreId &&
                          r.appointmentSlot === slot &&
                          ['Scheduled', 'Arrived', 'Quality Check', 'Weighing', 'Processing'].includes(r.status)
                        ).length;
                        const assignedCentre = (getEligibleFacilities(selectedRequest.district || 'Madurai', selectedRequest.crop, 0)).find(f => f.id === selectedRequest.centreId);
                        const counters = assignedCentre?.counters || 2;
                        const rate = assignedCentre?.processingRate || 8;
                        const predictedWait = bookedCount > 0
                          ? Math.max(5, Math.round((bookedCount / counters) * rate))
                          : Math.max(5, Math.round(((centre?.queueLength || 5) / counters) * rate));
                        const isHighDemand = bookedCount > 20 || predictedWait > 60;

                        return (
                          <tr key={slot} style={recommended ? { backgroundColor: '#fffcf4', border: '1px solid var(--accent)' } : {}}>
                            <td><strong>{label}</strong></td>
                            <td>{bookedCount} farmers</td>
                            <td>{predictedWait} min</td>
                            <td>
                              {recommended ? (
                                <span className="badge badge-warning text-xs">Recommended</span>
                              ) : isHighDemand ? (
                                <span className="badge badge-danger text-xs font-semibold text-red-700">High Demand</span>
                              ) : (
                                <span className="badge badge-success text-xs">Available</span>
                              )}
                            </td>
                            <td>
                              <button
                                className={`btn btn-sm ${recommended ? 'btn-secondary' : 'btn-outline'}`}
                                onClick={() => {
                                  assignSlotAndToken(selectedRequest.id, new Date().toISOString().split('T')[0], slot);
                                  setSelectedRequest(null);
                                }}
                              >
                                {recommended ? 'CONFIRM RECOMMENDED SLOT' : 'CONFIRM SLOT & TOKEN'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {['Scheduled', 'Arrived', 'Quality Check', 'Weighing', 'Processing'].includes(selectedRequest.status) && (
              <div className="flex-gap justify-end">
                <button className="btn btn-primary btn-sm flex-align" onClick={() => { setActiveTab('processing'); setSelectedRequest(null); }}>
                  <Scale size={16} /> GO TO PROCESSING YARD SCREEN
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Farmer</th>
                <th>District</th>
                <th>Crop Details</th>
                <th>Quantity</th>
                <th>Assigned Facility</th>
                <th>Status</th>
                <th>Review Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedRequestsForOfficer.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.id}</strong></td>
                  <td>{r.farmerName}</td>
                  <td>{r.district || 'Madurai'}</td>
                  <td>{r.crop} ({r.variety})</td>
                  <td>{r.quantity} {r.unit}</td>
                  <td>{r.centreName || 'Not Assigned'}</td>
                  <td>
                    <span className={`badge ${
                      r.status === 'Completed' ? 'badge-success' :
                      r.status === 'Pending Officer Approval' ? 'badge-warning' :
                      r.status === 'Rejected' || r.status === 'Cancelled' ? 'badge-danger' : 'badge-info'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-outline btn-xs flex-align" onClick={() => setSelectedRequest(r)}>
                      REVIEW <ChevronRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
