import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Scale } from 'lucide-react';

export default function InspectionStatus() {
  const { currentUser, requests } = useProcurement();

  const farmerRequests = requests.filter(r => r.farmerId === currentUser?.id);
  const activeAppointment = farmerRequests.find(r => ['Scheduled', 'Arrived', 'Quality Check', 'Weighing', 'Processing', 'Completed'].includes(r.status));
  const completedProcurement = farmerRequests.find(r => r.status === 'Completed');
  const targetReq = activeAppointment || completedProcurement;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Procurement Inspection & Processing Stages</h2>
        <p className="page-subtitle">Track quality checks, weighing scale readings, and completed receipts.</p>
      </div>

      {targetReq ? (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card">
            <h3 className="card-title"><Scale size={18} /> Processing Timeline</h3>
            
            <div className="space-y-6 mt-6" style={{ position: 'relative', paddingLeft: '24px' }}>
              <div style={{ position: 'absolute', top: '8px', bottom: '8px', left: '8px', width: '2px', backgroundColor: 'var(--border)' }}></div>

              <div className="relative">
                <div style={{
                  position: 'absolute', top: '4px', left: '-20px', width: '10px', height: '10px', borderRadius: '50%',
                  backgroundColor: ['Scheduled', 'Arrived', 'Quality Check', 'Weighing', 'Processing', 'Completed'].includes(targetReq.status) ? 'var(--secondary)' : 'var(--border)'
                }}></div>
                <h4 className="font-semibold text-sm text-slate-800">1. Appointment Scheduled</h4>
                <p className="text-xs text-muted">Gate Pass Token generated for assigned facility.</p>
              </div>

              <div className="relative">
                <div style={{
                  position: 'absolute', top: '4px', left: '-20px', width: '10px', height: '10px', borderRadius: '50%',
                  backgroundColor: ['Arrived', 'Quality Check', 'Weighing', 'Processing', 'Completed'].includes(targetReq.status) ? 'var(--secondary)' : 'var(--border)'
                }}></div>
                <h4 className="font-semibold text-sm text-slate-800">2. Arrived at Facility</h4>
                <p className="text-xs text-muted">Gate entry check-in verified by officer.</p>
              </div>

              <div className="relative">
                <div style={{
                  position: 'absolute', top: '4px', left: '-20px', width: '10px', height: '10px', borderRadius: '50%',
                  backgroundColor: ['Quality Check', 'Weighing', 'Processing', 'Completed'].includes(targetReq.status) ? 'var(--secondary)' : 'var(--border)'
                }}></div>
                <h4 className="font-semibold text-sm text-slate-800">3. Quality Check</h4>
                <p className="text-xs text-muted">Produce moisture and quality inspection.</p>
              </div>

              <div className="relative">
                <div style={{
                  position: 'absolute', top: '4px', left: '-20px', width: '10px', height: '10px', borderRadius: '50%',
                  backgroundColor: ['Weighing', 'Processing', 'Completed'].includes(targetReq.status) ? 'var(--secondary)' : 'var(--border)'
                }}></div>
                <h4 className="font-semibold text-sm text-slate-800">4. Digital Weighing Scale</h4>
                <p className="text-xs text-muted">Electronic scale measurement of net produce weight.</p>
              </div>

              <div className="relative">
                <div style={{
                  position: 'absolute', top: '4px', left: '-20px', width: '10px', height: '10px', borderRadius: '50%',
                  backgroundColor: ['Processing', 'Completed'].includes(targetReq.status) ? 'var(--secondary)' : 'var(--border)'
                }}></div>
                <h4 className="font-semibold text-sm text-slate-800">5. Receipt Processing</h4>
                <p className="text-xs text-muted">Official procurement receipt &amp; reference generation.</p>
              </div>

              <div className="relative">
                <div style={{
                  position: 'absolute', top: '4px', left: '-20px', width: '10px', height: '10px', borderRadius: '50%',
                  backgroundColor: targetReq.status === 'Completed' ? 'var(--secondary)' : 'var(--border)'
                }}></div>
                <h4 className="font-semibold text-sm text-slate-800">6. Completed</h4>
                <p className="text-xs text-muted">Procurement finalized. Forwarded to DBT payment engine.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-center" style={{ padding: '30px' }}>
          <p>No active processing updates available.</p>
        </div>
      )}
    </div>
  );
}
