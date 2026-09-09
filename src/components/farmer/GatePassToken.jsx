import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Calendar } from 'lucide-react';

export default function GatePassToken({ setActiveTab }) {
  const { currentUser, requests } = useProcurement();

  const farmerRequests = requests.filter(r => r.farmerId === currentUser?.id);
  const scheduledAppointment = farmerRequests.find(r => ['Scheduled', 'Arrived', 'Quality Check', 'Weighing', 'Processing'].includes(r.status));

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Procurement Gate Pass Ticket</h2>
        <p className="page-subtitle">Present this token at the procurement centre entry gate.</p>
      </div>

      {scheduledAppointment ? (
        <div style={{ maxWidth: '500px', margin: '0 auto' }} className="card">
          <div style={{ borderBottom: '2px dashed var(--border)', paddingBottom: '20px', marginBottom: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
              Department of Agriculture, Tamil Nadu
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--primary)', margin: '4px 0' }}>Official Gate Pass</h3>
            <span className="badge badge-success">Valid Entry Pass</span>
          </div>

          <div className="space-y-4 text-sm" style={{ lineHeight: 1.6 }}>
            <div className="flex-between">
              <span className="text-muted font-medium">Farmer Name:</span>
              <span className="font-semibold">{currentUser?.name}</span>
            </div>
            <div className="flex-between">
              <span className="text-muted font-medium">Pass Token ID:</span>
              <span className="font-mono font-bold text-amber-700 text-lg">TOKEN #{scheduledAppointment.tokenNumber}</span>
            </div>
            <div className="flex-between">
              <span className="text-muted font-medium">Crop Type:</span>
              <span className="font-semibold">{scheduledAppointment.crop} ({scheduledAppointment.variety})</span>
            </div>
            <div className="flex-between">
              <span className="text-muted font-medium">Quantity:</span>
              <span className="font-semibold">{scheduledAppointment.quantity} {scheduledAppointment.unit}</span>
            </div>
            <hr style={{ borderColor: 'var(--border)' }} />
            <div className="flex-between">
              <span className="text-muted font-medium">Procurement Facility:</span>
              <span className="font-semibold text-slate-800">{scheduledAppointment.centreName}</span>
            </div>
            <div className="flex-between">
              <span className="text-muted font-medium">District:</span>
              <span className="font-semibold text-slate-800">{scheduledAppointment.district || 'Madurai'}</span>
            </div>
            <div className="flex-between">
              <span className="text-muted font-medium">Date &amp; Time Slot:</span>
              <span className="font-semibold text-slate-800">{scheduledAppointment.appointmentDate} | {scheduledAppointment.appointmentSlot}</span>
            </div>
          </div>

          <div className="flex-gap mt-6">
            <button className="btn btn-outline btn-block" onClick={() => alert('Print command triggered for Gate Pass Token.')}>
              Print Token Pass
            </button>
            <button className="btn btn-secondary btn-block" onClick={() => setActiveTab('queue')}>
              Track Live Queue
            </button>
          </div>
        </div>
      ) : (
        <div className="card text-center" style={{ padding: '30px' }}>
          <Calendar size={48} className="text-muted" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <p>You do not have a scheduled token. Submit a produce registration request first.</p>
        </div>
      )}
    </div>
  );
}
