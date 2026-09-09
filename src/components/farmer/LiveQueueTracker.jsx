import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Users, RefreshCw } from 'lucide-react';

export default function LiveQueueTracker() {
  const {
    currentUser,
    requests,
    currentServingToken,
    refreshQueue,
    calculateFarmersAhead,
    calculateEstimatedWait
  } = useProcurement();

  const farmerRequests = requests.filter(r => r.farmerId === currentUser?.id);
  const scheduledAppointment = farmerRequests.find(r => ['Scheduled', 'Arrived', 'Quality Check', 'Weighing', 'Processing'].includes(r.status));

  const tokenNum = scheduledAppointment?.tokenNumber;
  const queueAhead = tokenNum ? calculateFarmersAhead(tokenNum) : 0;
  const waitEstimates = tokenNum ? calculateEstimatedWait(tokenNum, scheduledAppointment.centreId) : 0;

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h2 className="page-title">Live Queue Status Tracker</h2>
          <p className="page-subtitle">Real-time gate queue position and AI wait time estimates.</p>
        </div>
        <button className="btn btn-outline btn-sm flex-align" onClick={() => refreshQueue()}>
          <RefreshCw size={14} /> Refresh Queue
        </button>
      </div>

      {scheduledAppointment ? (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card text-center mb-4">
            <span className="text-xs text-muted font-medium block">Your Assigned Token</span>
            <h3 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--primary)', margin: '4px 0' }}>#{scheduledAppointment.tokenNumber}</h3>
            <p className="text-sm font-semibold text-slate-600 mb-4">{scheduledAppointment.centreName}</p>

            <div className="grid-3col text-sm" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <div>
                <span className="text-muted block text-xs font-medium">Currently Serving</span>
                <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--accent)' }}>#{currentServingToken}</span>
              </div>
              <div>
                <span className="text-muted block text-xs font-medium">Farmers Ahead</span>
                <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-main)' }}>{queueAhead}</span>
              </div>
              <div>
                <span className="text-muted block text-xs font-medium">Predicted Wait</span>
                <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--secondary)' }}>{waitEstimates} mins</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }} className="flex-align">
              <Users size={16} /> Facility Entry Queue List
            </h4>

            <div className="space-y-3">
              <div className="p-3 rounded-lg border flex justify-between items-center bg-green-50 border-green-200">
                <div className="flex items-center gap-3">
                  <span className="font-mono bg-green-600 text-white rounded px-2 py-0.5 text-xs">#{currentServingToken}</span>
                  <span className="text-sm font-semibold">Token currently processing at scale</span>
                </div>
                <span className="badge badge-success text-xs">Processing</span>
              </div>

              {queueAhead > 1 && (
                <>
                  <div className="text-center text-muted font-bold" style={{ fontSize: '20px', lineHeight: 1 }}>⋮</div>
                  <div className="p-3 rounded-lg border border-slate-100 bg-slate-50 text-center text-xs text-muted">
                    {queueAhead - 1} farmers waiting in queue
                  </div>
                </>
              )}

              {queueAhead > 0 && (
                <div className="text-center text-muted font-bold" style={{ fontSize: '20px', lineHeight: 1 }}>⋮</div>
              )}

              <div className="p-3 rounded-lg border flex justify-between items-center bg-amber-50 border-amber-200">
                <div className="flex items-center gap-3">
                  <span className="font-mono bg-amber-600 text-white rounded px-2 py-0.5 text-xs">#{tokenNum}</span>
                  <span className="text-sm font-semibold">{currentUser?.name} (You)</span>
                </div>
                <span className="badge badge-warning text-xs">{scheduledAppointment.status}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-center" style={{ padding: '30px' }}>
          <Users size={48} className="text-muted" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <p>No active scheduled appointment details.</p>
        </div>
      )}
    </div>
  );
}
