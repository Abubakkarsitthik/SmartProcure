import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Users, RefreshCw, Info } from 'lucide-react';

export default function QueueManagement({ setActiveTab }) {
  const {
    queueItems,
    requests,
    currentServingToken,
    advanceQueue,
    updateProcurementStage
  } = useProcurement();

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h2 className="page-title">Live Facility Queue Management</h2>
          <p className="page-subtitle">Supervise entry queue at Madurai Procurement Centre 03 and advance gate tokens.</p>
        </div>
        <button className="btn btn-secondary btn-sm flex-align" onClick={() => advanceQueue()}>
          <RefreshCw size={14} /> CALL NEXT TOKEN (#{currentServingToken + 1})
        </button>
      </div>

      <div className="grid-2-1">
        <div className="card">
          <h3 className="card-title"><Users size={18} /> Facility Queue List (Madurai Procurement Centre 03)</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Farmer Name</th>
                  <th>Crop</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {queueItems.map(item => (
                  <tr 
                    key={item.token} 
                    style={{ backgroundColor: parseInt(item.token, 10) === currentServingToken ? '#f0fdf4' : 'white' }}
                  >
                    <td><span className="font-mono font-bold">#{item.token}</span></td>
                    <td>{item.farmerName}</td>
                    <td>{item.crop} ({item.quantity} kg)</td>
                    <td>
                      <span className={`badge ${
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
                            Start Processing
                          </button>
                        )}
                        {(item.status === 'Processing' || item.status === 'Quality Check' || item.status === 'Weighing') && (
                          <button 
                            className="btn btn-primary btn-xs" 
                            onClick={() => setActiveTab('processing')}
                          >
                            Weigh & Complete
                          </button>
                        )}
                        {item.status === 'Completed' && (
                          <span className="text-xs text-muted">Completed ✓</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ height: 'fit-content' }}>
          <h3 className="card-title">Serving Statistics</h3>
          <div className="space-y-4 text-sm" style={{ lineHeight: 1.8 }}>
            <div className="flex-between">
              <span className="text-muted">Serving Counter 1:</span>
              <span className="font-bold text-green-700">Token #{currentServingToken}</span>
            </div>
            <div className="flex-between">
              <span className="text-muted">Serving Counter 2:</span>
              <span className="font-bold">Token #{currentServingToken + 1}</span>
            </div>
            <div className="flex-between">
              <span className="text-muted">Scheduled Today:</span>
              <span className="font-bold text-slate-800">{requests.filter(r => ['Scheduled', 'Arrived', 'Quality Check', 'Weighing', 'Processing'].includes(r.status)).length} farmers</span>
            </div>
            <hr style={{ borderColor: 'var(--border)' }} />
            <div className="alert alert-success text-xs">
              <Info size={14} />
              <span>AI waiting-time estimate automatically updates as earlier tokens complete.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
