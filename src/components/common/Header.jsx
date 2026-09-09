import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { ShieldAlert, Sparkles, Bell, LogOut, Menu, X } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

export default function Header({ sidebarOpen, setSidebarOpen, currentView, setCurrentView }) {
  const { currentUser, notifications, logout, addNotification } = useProcurement();
  const [notifOpen, setNotifOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Tri-color Top Accent Bar */}
      <div className="tricolor-bar">
        <div className="saffron"></div>
        <div className="white"></div>
        <div className="green"></div>
      </div>

      {/* Header Banner */}
      <div className="demo-banner" style={{ backgroundColor: 'var(--primary)', color: 'white', borderBottom: 'none' }}>
        <ShieldAlert size={15} />
        <span>Tamil Nadu Farmer Procurement & Queue Coordination Portal | Department of Agriculture</span>
      </div>

      {/* Main Navbar */}
      <header className="govt-header">
        <div className="header-brand">
          <button 
            className="menu-btn" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="header-logo">SP</div>
          <div className="header-title-group">
            <h1>
              SMARTPROCURE <Sparkles size={16} className="text-amber-500" />
            </h1>
            <p>Tamil Nadu District Procurement & Queue Management</p>
          </div>
        </div>

        <div className="header-actions">
          {/* Language Selector */}
          <div className="flex-align" style={{ marginRight: '4px' }}>
            <span 
              className="badge text-xs" 
              style={{ 
                backgroundColor: 'var(--bg-main)', 
                color: 'var(--text-main)', 
                border: '1px solid var(--border)',
                cursor: 'pointer',
                fontWeight: 500,
                padding: '4px 8px'
              }}
              title="Tamil Nadu Language Support"
            >
              English | தமிழ்
            </span>
          </div>

          {currentUser && (
            <div className="flex-align">
              <span className={`badge ${
                currentUser.role === 'admin' ? 'badge-secondary' :
                currentUser.role === 'officer' ? 'badge-danger' : 'badge-success'
              }`}>
                {currentUser.role === 'admin' ? 'System Administrator' :
                 currentUser.role === 'officer' ? 'Procurement Officer' : 'Farmer'}
              </span>
              <span className="text-muted text-sm hidden md:inline">| {currentUser.name} ({currentUser.district || currentUser.department || 'Tamil Nadu'})</span>
            </div>
          )}

          {/* Notifications Bell */}
          <div className="relative">
            <button 
              className="btn btn-outline btn-sm" 
              style={{ borderRadius: '50%', width: '38px', height: '38px', padding: 0 }}
              onClick={() => setNotifOpen(!notifOpen)}
              aria-label="View notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#DC2626',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notifOpen && (
              <NotificationDropdown 
                notifications={notifications}
                onClose={() => setNotifOpen(false)}
                onMarkRead={() => addNotification('All notifications marked as read.')}
              />
            )}
          </div>

          {currentUser ? (
            <button className="btn btn-outline btn-sm flex-align" onClick={() => logout()}>
              <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            currentView !== 'login' && (
              <button className="btn btn-primary btn-sm" onClick={() => setCurrentView('login')}>
                Login
              </button>
            )
          )}
        </div>
      </header>
    </>
  );
}
