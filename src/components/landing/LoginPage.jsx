import React, { useState } from 'react';
import { User, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';

export default function LoginPage({ setCurrentView }) {
  const { setCurrentUser } = useProcurement();
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginId === 'farmer001' && loginPassword === '1234') {
      setCurrentUser({
        id: 'farmer001',
        name: 'Arjun Kumar',
        role: 'farmer',
        mobile: '9876543210',
        village: 'Vadipatti',
        district: 'Madurai',
        state: 'Tamil Nadu',
        language: 'English'
      });
      setCurrentView('farmer');
      setLoginError('');
    } else if (loginId === 'officer001' && loginPassword === '1234') {
      setCurrentUser({
        id: 'officer001',
        name: 'Rajesh Kumar',
        role: 'officer',
        officerId: 'OFF-2026-99',
        assignedCentre: 'Madurai Procurement Centre 03',
        district: 'Madurai'
      });
      setCurrentView('officer');
      setLoginError('');
    } else if (loginId === 'admin001' && loginPassword === '1234') {
      setCurrentUser({
        id: 'admin001',
        name: 'Dr. S. Venkatesan',
        role: 'admin',
        designation: 'State Procurement Director',
        department: 'Department of Agriculture, Tamil Nadu',
        mobile: '9900000001',
        state: 'Tamil Nadu'
      });
      setCurrentView('admin');
      setLoginError('');
    } else {
      setLoginError('Invalid credentials. Please check your portal ID and password.');
    }
  };

  const triggerQuickLogin = (role) => {
    if (role === 'farmer') {
      setCurrentUser({
        id: 'farmer001',
        name: 'Arjun Kumar',
        role: 'farmer',
        mobile: '9876543210',
        village: 'Vadipatti',
        district: 'Madurai',
        state: 'Tamil Nadu',
        language: 'English'
      });
      setCurrentView('farmer');
    } else if (role === 'officer') {
      setCurrentUser({
        id: 'officer001',
        name: 'Rajesh Kumar',
        role: 'officer',
        officerId: 'OFF-2026-99',
        assignedCentre: 'Madurai Procurement Centre 03',
        district: 'Madurai'
      });
      setCurrentView('officer');
    } else if (role === 'admin') {
      setCurrentUser({
        id: 'admin001',
        name: 'Dr. S. Venkatesan',
        role: 'admin',
        designation: 'State Procurement Director',
        department: 'Department of Agriculture, Tamil Nadu',
        mobile: '9900000001',
        state: 'Tamil Nadu'
      });
      setCurrentView('admin');
    }
    setLoginError('');
  };

  return (
    <div style={{ maxWidth: '440px', margin: '60px auto', padding: '24px' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="header-logo" style={{ margin: '0 auto 12px', width: '48px', height: '48px', fontSize: '20px', fontWeight: 700 }}>SP</div>
          <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--primary)', letterSpacing: '-0.01em' }}>SMARTPROCURE</h2>
          <p className="text-muted text-sm mt-1">Tamil Nadu Agriculture &amp; Procurement Portal</p>
        </div>

        <form onSubmit={handleLogin}>
          {loginError && <div className="alert alert-danger text-xs">{loginError}</div>}
          
          <div className="form-group">
            <label className="form-label">User ID / Portal Credentials</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter your portal ID"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••" 
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block mb-4">
            Login to Portal
          </button>

          <div style={{ position: 'relative', textAlign: 'center', margin: '20px 0' }}>
            <hr style={{ borderColor: 'var(--border)' }} />
            <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#fff', padding: '0 10px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Quick Portal Access</span>
          </div>

          <div className="grid-3col">
            <button type="button" className="btn btn-outline btn-sm flex-align" onClick={() => triggerQuickLogin('farmer')}>
              <User size={14} /> Farmer
            </button>
            <button type="button" className="btn btn-outline btn-sm flex-align" onClick={() => triggerQuickLogin('officer')}>
              <ShieldAlert size={14} /> Officer
            </button>
            <button type="button" className="btn btn-outline btn-sm flex-align" onClick={() => triggerQuickLogin('admin')}>
              <ShieldCheck size={14} /> Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
