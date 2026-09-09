import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { TAMIL_NADU_DISTRICTS, SUPPORTED_CROPS } from '../../constants/procurementConstants';
import { CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

export default function RegisterProduce({ setActiveTab }) {
  const { currentUser, submitRequest, getAIRecommendation } = useProcurement();

  const [produceForm, setProduceForm] = useState({
    state: 'Tamil Nadu',
    district: currentUser?.district || 'Madurai',
    crop: 'Paddy – Common',
    variety: 'CO 51',
    quantity: '500',
    unit: 'kg',
    village: currentUser?.village || 'Vadipatti',
    readinessDate: new Date().toISOString().split('T')[0]
  });

  const [produceSuccess, setProduceSuccess] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState('');

  // Live Centre Recommendation
  const liveAIRec = getAIRecommendation(produceForm.district, produceForm.crop, produceForm.quantity);

  const handleRegisterProduceSubmit = (e) => {
    e.preventDefault();
    if (!produceForm.quantity || Number(produceForm.quantity) <= 0) {
      alert('Please enter a valid requested produce quantity.');
      return;
    }

    const newReq = submitRequest({
      farmerId: currentUser.id,
      farmerName: currentUser.name,
      crop: produceForm.crop,
      variety: produceForm.variety,
      quantity: produceForm.quantity,
      unit: produceForm.unit,
      village: produceForm.village,
      state: produceForm.state,
      district: produceForm.district,
      readinessDate: produceForm.readinessDate
    });

    setCreatedRequestId(newReq.id);
    setProduceSuccess(true);
    setTimeout(() => {
      setActiveTab('requests');
    }, 1800);
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Register Produce for Government Procurement</h2>
        <p className="page-subtitle">
          Submit crop harvest details to receive an officer-verified facility allocation and scheduled gate pass.
        </p>
      </div>

      {produceSuccess && (
        <div className="alert alert-success mb-6 p-4">
          <CheckCircle size={20} />
          <div>
            <div className="font-bold text-sm">Procurement Request Submitted Successfully!</div>
            <div className="text-xs">Filing Reference ID: <strong>{createdRequestId}</strong>. Redirecting to My Requests...</div>
          </div>
        </div>
      )}

      <div className="grid-3col" style={{ gridTemplateColumns: '1.4fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Form Sections */}
        <div className="card">
          <form onSubmit={handleRegisterProduceSubmit}>
            
            {/* Step 1: Produce Details */}
            <div className="mb-6">
              <div className="flex-align mb-3 pb-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 text-xs font-semibold flex items-center justify-center mr-2">1</span>
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Produce Details</h3>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Crop Name</label>
                  <select 
                    className="form-select"
                    value={produceForm.crop}
                    onChange={(e) => setProduceForm({ ...produceForm, crop: e.target.value })}
                  >
                    {SUPPORTED_CROPS.map(cr => (
                      <option key={cr} value={cr}>{cr}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Crop Variety</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. CO 51, ADT 45" 
                    value={produceForm.variety}
                    onChange={(e) => setProduceForm({ ...produceForm, variety: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="e.g. 500" 
                    value={produceForm.quantity}
                    onChange={(e) => setProduceForm({ ...produceForm, quantity: e.target.value })}
                    min="10"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Measurement Unit</label>
                  <select 
                    className="form-select"
                    value={produceForm.unit}
                    onChange={(e) => setProduceForm({ ...produceForm, unit: e.target.value })}
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="Quintals">Quintals (q)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Location & Readiness */}
            <div className="mb-6">
              <div className="flex-align mb-3 pb-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 text-xs font-semibold flex items-center justify-center mr-2">2</span>
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Location &amp; Harvest Readiness</h3>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input type="text" className="form-input text-slate-500 font-medium" value="Tamil Nadu" disabled />
                </div>

                <div className="form-group">
                  <label className="form-label">District</label>
                  <select 
                    className="form-select"
                    value={produceForm.district}
                    onChange={(e) => setProduceForm({ ...produceForm, district: e.target.value })}
                  >
                    {TAMIL_NADU_DISTRICTS.map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Village / Taluk</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Vadipatti"
                    value={produceForm.village} 
                    onChange={(e) => setProduceForm({ ...produceForm, village: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Produce Ready Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={produceForm.readinessDate}
                    onChange={(e) => setProduceForm({ ...produceForm, readinessDate: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Review & Submit */}
            <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex-between" style={{ alignItems: 'center' }}>
                <span className="text-xs text-muted">
                  Farmer: <strong>{currentUser?.name}</strong> • State: Tamil Nadu
                </span>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={produceSuccess}
                >
                  Submit Produce Filing <ArrowRight size={16} />
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* Right Side: Recommended Centre & Decision Support */}
        <div>
          <div className="card mb-4" style={{ borderLeft: '4px solid var(--primary)' }}>
            <div className="flex-between mb-3">
              <span className="text-xs text-muted font-semibold">
                Recommended Facility
              </span>
              <span className="badge badge-success text-xs">Best Match</span>
            </div>

            {liveAIRec.recommendedFacility ? (
              <div className="space-y-3">
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--primary)', marginBottom: '2px' }}>
                    {liveAIRec.recommendedFacility.name}
                  </h4>
                  <p className="text-xs text-slate-600">{liveAIRec.recommendedFacility.location}</p>
                </div>

                <div className="grid-3col text-center p-3 rounded bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-muted block">Current Queue</span>
                    <span className="font-bold text-slate-800 text-sm">{liveAIRec.queue} farmers</span>
                  </div>
                  <div>
                    <span className="text-muted block">Available Cap.</span>
                    <span className="font-bold text-slate-800 text-sm">{liveAIRec.remainingCapacity.toLocaleString('en-IN')} kg</span>
                  </div>
                  <div>
                    <span className="text-muted block">Est. Wait</span>
                    <span className="font-bold text-green-700 text-sm">{liveAIRec.predictedWait} min</span>
                  </div>
                </div>

                <div className="p-3 rounded bg-green-50 border border-green-200 text-xs">
                  <div className="font-bold text-green-900 mb-1">Why this centre?</div>
                  <ul className="text-slate-700 space-y-1" style={{ listStyleType: 'disc', paddingLeft: '16px' }}>
                    <li>Supports <strong>{produceForm.crop}</strong> procurement</li>
                    <li>Sufficient available storage capacity</li>
                    <li>Lower yard congestion in {produceForm.district}</li>
                  </ul>
                </div>

                <p className="text-xs text-muted italic">
                  * This recommendation acts as decision support. The procurement officer will confirm assignment upon review.
                </p>
              </div>
            ) : (
              <div className="alert alert-danger text-xs">
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span>{liveAIRec.reason}</span>
              </div>
            )}
          </div>

          {/* Alternative District Facilities */}
          <div className="card">
            <h4 className="text-xs font-semibold text-muted mb-3">
              Other Facilities in {produceForm.district}
            </h4>
            <div className="space-y-2">
              {liveAIRec.eligibleList.length <= 1 ? (
                <div className="text-xs text-muted">
                  No other active procurement yards currently for {produceForm.crop} in {produceForm.district}.
                </div>
              ) : (
                liveAIRec.eligibleList
                  .filter(f => f.id !== liveAIRec.recommendedFacility?.id)
                  .map(fac => (
                    <div key={fac.id} className="p-2 border rounded text-xs flex-between bg-slate-50">
                      <div>
                        <div className="font-semibold text-slate-800">{fac.name}</div>
                        <div className="text-muted">Queue: {fac.queueLength} • {fac.type}</div>
                      </div>
                      <span className={`badge ${fac.capacityAvailable ? 'badge-neutral' : 'badge-danger'}`}>
                        {fac.capacityAvailable ? 'Available' : 'Full'}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
