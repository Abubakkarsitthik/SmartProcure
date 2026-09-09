import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { CreditCard, CheckCircle, Info } from 'lucide-react';

export default function DBTPaymentStatus() {
  const { currentUser, requests } = useProcurement();

  const farmerRequests = requests.filter(r => r.farmerId === currentUser?.id);
  const completedProcurement = farmerRequests.find(r => r.status === 'Completed');

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Direct Benefit Transfer (DBT) Payment Status</h2>
        <p className="page-subtitle">Track direct bank transfer credited to your bank account.</p>
      </div>

      {completedProcurement ? (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card">
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span className="text-xs text-muted font-medium block">Total MSP Value</span>
              <h3 style={{ fontSize: '26px', fontWeight: 600, color: 'var(--primary)' }}>
                ₹{(completedProcurement.procurementAmount || 10824).toLocaleString('en-IN')}
              </h3>
              
              <div style={{ marginTop: '12px' }}>
                <span className={`badge ${
                  completedProcurement.paymentStatus === 'PAYMENT COMPLETED' ? 'badge-success' :
                  completedProcurement.paymentStatus === 'PAYMENT INITIATED' ? 'badge-warning' : 'badge-neutral'
                }`}>
                  {completedProcurement.paymentStatus}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-sm" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <div className="flex-between">
                <span className="text-muted">Farmer Bank Account:</span>
                <span className="font-semibold text-slate-800">State Bank of India (***3210)</span>
              </div>
              <div className="flex-between">
                <span className="text-muted">Aadhaar Linked Status:</span>
                <span className="text-green-600 font-semibold flex-align"><CheckCircle size={14} /> Verified</span>
              </div>
              <div className="flex-between">
                <span className="text-muted">Procurement Ref ID:</span>
                <span className="font-mono font-bold">{completedProcurement.referenceNumber || 'PROC-2026-00157'}</span>
              </div>
            </div>

            <div className="alert alert-warning text-xs mt-4">
              <Info size={14} />
              <span>
                {completedProcurement.paymentStatus === 'PAYMENT PENDING' && 'Awaiting Officer payment initiation.'}
                {completedProcurement.paymentStatus === 'PAYMENT INITIATED' && 'DBT transfer in progress.'}
                {completedProcurement.paymentStatus === 'PAYMENT COMPLETED' && 'Transfer completed! Money credited to Aadhaar-linked SBI account.'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-center" style={{ padding: '30px' }}>
          <CreditCard size={48} className="text-muted" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <p>Payment details will appear once crop weighing and procurement process is complete.</p>
        </div>
      )}
    </div>
  );
}
