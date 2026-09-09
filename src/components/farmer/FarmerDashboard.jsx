import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  Users,
  Clock,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  Scale
} from 'lucide-react';

export default function FarmerDashboard({ setActiveTab, onSelectRequest }) {
  const {
    currentUser,
    requests,
    currentServingToken,
    calculateFarmersAhead,
    calculateEstimatedWait
  } = useProcurement();

  const farmerRequests = requests.filter(r => r.farmerId === currentUser?.id);
  
  // Find primary active request (in progress or pending)
  const activeRequest = farmerRequests.find(r =>
    ['Pending Officer Approval', 'Approved', 'Centre Assigned', 'Scheduled', 'Arrived', 'Quality Check', 'Weighing', 'Processing'].includes(r.status)
  ) || farmerRequests[0]; // fallback to most recent if completed

  const tokenNum = activeRequest?.tokenNumber;
  const queueAhead = tokenNum ? calculateFarmersAhead(tokenNum) : 0;
  const waitMinutes = tokenNum ? calculateEstimatedWait(tokenNum, activeRequest?.centreId) : 0;

  const handleViewRequest = (req) => {
    if (onSelectRequest) {
      onSelectRequest(req);
    }
    setActiveTab('requests');
  };

  return (
    <div>
      {/* Top Banner / Welcome */}
      <div className="page-header flex-between">
        <div>
          <h2 className="page-title">Welcome, {currentUser?.name || 'Farmer'}</h2>
          <p className="page-subtitle">
            Tamil Nadu Agriculture Procurement | {currentUser?.village ? `${currentUser.village}, ` : ''}{currentUser?.district || 'Madurai'}
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm flex-align"
          onClick={() => setActiveTab('register')}
        >
          <PlusCircle size={16} /> Register Harvest
        </button>
      </div>

      {/* Hero Active Request Decision Surface */}
      {activeRequest ? (
        <div
          className="card mb-6"
          style={{
            borderLeft: '4px solid var(--primary)',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Status Label Banner */}
          <div className="flex-between mb-3" style={{ flexWrap: 'wrap', gap: '8px' }}>
            <div className="flex-align">
              <span className="text-xs text-muted font-semibold">
                Active Filing #{activeRequest.id}
              </span>
              <span className="text-xs text-muted mx-2">•</span>
              <span className="text-xs text-muted">
                {activeRequest.crop} ({activeRequest.variety || 'Standard Grade'})
              </span>
            </div>

            <span
              className={`badge ${
                activeRequest.status === 'Completed'
                  ? 'badge-success'
                  : activeRequest.status === 'Pending Officer Approval'
                  ? 'badge-warning'
                  : activeRequest.status === 'Rejected'
                  ? 'badge-danger'
                  : 'badge-info'
              }`}
            >
              {activeRequest.status === 'Pending Officer Approval'
                ? 'Awaiting Review'
                : activeRequest.status}
            </span>
          </div>

          {/* DYNAMIC HERO CONTENT BASED ON REQUEST STAGE */}

          {/* STATE 1: PENDING OFFICER APPROVAL */}
          {activeRequest.status === 'Pending Officer Approval' && (
            <div className="py-2">
              <div className="grid-2col" style={{ alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--primary)', marginBottom: '4px' }}>
                    Filing Submitted &amp; Awaiting Review
                  </h3>
                  <p className="text-sm text-muted mb-4">
                    Your registration for <strong>{activeRequest.quantity} {activeRequest.unit || 'kg'}</strong> of {activeRequest.crop} in {activeRequest.district || 'Madurai'} has been recorded. The procurement officer will verify crop details and allocate the best local centre.
                  </p>
                  <div className="flex-align text-xs text-slate-700 bg-amber-50 p-2 rounded border border-amber-200">
                    <AlertCircle size={15} className="text-amber-600" />
                    <span>Officer decision expected shortly. You will receive an appointment slot upon confirmation.</span>
                  </div>
                </div>

                <div className="text-right" style={{ alignSelf: 'center' }}>
                  <button
                    className="btn btn-outline"
                    onClick={() => handleViewRequest(activeRequest)}
                  >
                    View Request Details <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: APPROVED / CENTRE ASSIGNED */}
          {['Approved', 'Centre Assigned'].includes(activeRequest.status) && (
            <div className="py-2">
              <div className="grid-2col" style={{ alignItems: 'center' }}>
                <div>
                  <div className="text-xs font-semibold text-green-700 mb-1">
                    Procurement Centre Assigned
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--primary)', marginBottom: '6px' }}>
                    {activeRequest.centreName || 'Designated District Yard'}
                  </h3>
                  <p className="text-sm text-muted mb-3">
                    Quantity: <strong>{activeRequest.quantity} {activeRequest.unit || 'kg'}</strong> • Readiness: {activeRequest.readinessDate}
                  </p>
                  <div className="text-xs text-muted">
                    Officer is generating your entry time slot and gate pass token.
                  </div>
                </div>

                <div className="text-right">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleViewRequest(activeRequest)}
                  >
                    View Assigned Centre <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STATE 3: SCHEDULED (TOKEN ACTIVE) */}
          {activeRequest.status === 'Scheduled' && (
            <div className="py-2">
              <div className="grid-3col" style={{ alignItems: 'center' }}>
                <div>
                  <span className="text-xs text-muted block font-medium">Gate Entry Token</span>
                  <div style={{ fontSize: '28px', fontWeight: 600, color: 'var(--primary)', lineHeight: 1.2 }}>
                    #{activeRequest.tokenNumber}
                  </div>
                  <div className="text-xs font-semibold text-slate-700 mt-1">
                    {activeRequest.centreName}
                  </div>
                  <div className="text-xs text-muted mt-1">
                    {activeRequest.appointmentDate} • {activeRequest.appointmentSlot}
                  </div>
                </div>

                <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '16px' }}>
                  <div className="space-y-2">
                    <div className="flex-align">
                      <Users size={16} className="text-muted" />
                      <span className="text-sm">
                        Farmers Ahead: <strong>{queueAhead}</strong>
                      </span>
                    </div>
                    <div className="flex-align">
                      <Clock size={16} className="text-amber-600" />
                      <span className="text-sm">
                        Estimated Wait: <strong className="text-amber-700">{waitMinutes} mins</strong>
                      </span>
                    </div>
                    <div className="text-xs text-muted">
                      Counter now serving: <strong>#{currentServingToken}</strong>
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <button
                    className="btn btn-primary btn-block flex-align justify-center"
                    onClick={() => handleViewRequest(activeRequest)}
                  >
                    <FileText size={16} /> View Gate Pass
                  </button>
                  <button
                    className="btn btn-outline btn-block flex-align justify-center"
                    onClick={() => handleViewRequest(activeRequest)}
                  >
                    <Users size={16} /> Track Queue
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STATE 4: ARRIVED / QUALITY CHECK / WEIGHING / PROCESSING */}
          {['Arrived', 'Quality Check', 'Weighing', 'Processing'].includes(activeRequest.status) && (
            <div className="py-2">
              <div className="grid-2col" style={{ alignItems: 'center' }}>
                <div>
                  <div className="flex-align mb-1">
                    <span className="badge badge-warning text-xs">At Facility Yard</span>
                    <span className="text-xs text-muted ml-2">Token #{activeRequest.tokenNumber}</span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--primary)', marginBottom: '4px' }}>
                    {activeRequest.status === 'Arrived' && 'Checked In at Entry Gate'}
                    {activeRequest.status === 'Quality Check' && 'Quality & Moisture Inspection'}
                    {activeRequest.status === 'Weighing' && 'Electronic Weighing Scale Unloading'}
                    {activeRequest.status === 'Processing' && 'Procurement Receipt Generation'}
                  </h3>
                  <p className="text-sm text-muted mb-2">
                    Facility: <strong>{activeRequest.centreName}</strong>
                  </p>
                  <p className="text-xs text-slate-600">
                    Your produce is currently undergoing physical inspection and electronic weighing. Stay in the staging area.
                  </p>
                </div>

                <div className="text-right">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleViewRequest(activeRequest)}
                  >
                    <Scale size={16} /> View Yard Stage <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STATE 5: COMPLETED */}
          {activeRequest.status === 'Completed' && (
            <div className="py-2">
              <div className="grid-3col" style={{ alignItems: 'center' }}>
                <div>
                  <div className="flex-align text-green-700 text-xs font-semibold mb-1">
                    <CheckCircle2 size={15} /> Procurement Finalized
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 600, color: 'var(--primary)' }}>
                    ₹{(activeRequest.procurementAmount || 0).toLocaleString('en-IN')}
                  </div>
                  <span className="text-xs text-muted">
                    Weighed Qty: {activeRequest.actualQuantity || activeRequest.quantity} kg
                  </span>
                </div>

                <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '16px' }}>
                  <span className="text-xs text-muted block font-medium">DBT Transfer Status</span>
                  <span
                    className={`badge mt-1 ${
                      activeRequest.paymentStatus === 'PAYMENT COMPLETED'
                        ? 'badge-success'
                        : 'badge-warning'
                    }`}
                  >
                    {activeRequest.paymentStatus || 'PAYMENT PENDING'}
                  </span>
                  <div className="text-xs font-mono text-muted mt-2">
                    Ref: {activeRequest.referenceNumber || 'PROC-2026-XXXX'}
                  </div>
                </div>

                <div className="text-right">
                  <button
                    className="btn btn-outline"
                    onClick={() => handleViewRequest(activeRequest)}
                  >
                    <CreditCard size={16} /> View Payment Receipt
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="card text-center mb-6" style={{ padding: '40px 20px' }}>
          <FileText size={40} className="text-muted" style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>
            No Active Procurement Filings
          </h3>
          <p className="text-muted text-sm mb-4" style={{ maxWidth: '420px', margin: '0 auto 16px' }}>
            Register your harvest to submit an MSP produce procurement request, get assigned to your nearest local centre, and receive a digital gate pass.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => setActiveTab('register')}
          >
            <PlusCircle size={16} /> Register Produce
          </button>
        </div>
      )}

      {/* Recent Requests Summary Section */}
      <div className="card">
        <div className="flex-between mb-4">
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Your Procurement Filings</h3>
            <p className="text-xs text-muted">History of submitted requests and completed transactions</p>
          </div>
          {farmerRequests.length > 0 && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setActiveTab('requests')}
            >
              View All Filings ({farmerRequests.length})
            </button>
          )}
        </div>

        {farmerRequests.length === 0 ? (
          <div className="text-center py-6 text-muted text-sm">
            No previous harvest filings recorded.
          </div>
        ) : (
          <div className="table-container">
            <table className="table text-sm">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Crop</th>
                  <th>Quantity</th>
                  <th>Assigned Centre</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {farmerRequests.slice(0, 3).map(r => (
                  <tr key={r.id}>
                    <td><strong className="font-mono">{r.id}</strong></td>
                    <td>{r.crop} ({r.variety || 'Standard'})</td>
                    <td>{r.quantity} {r.unit || 'kg'}</td>
                    <td className="text-slate-700">{r.centreName || 'Pending Allocation'}</td>
                    <td>
                      <span
                        className={`badge text-xs ${
                          r.status === 'Completed'
                            ? 'badge-success'
                            : r.status === 'Pending Officer Approval'
                            ? 'badge-warning'
                            : 'badge-info'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleViewRequest(r)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
