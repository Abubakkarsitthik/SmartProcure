import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Search,
  HelpCircle,
  User,
  Scale,
  TrendingUp,
  BarChart3,
  Building2,
  LogOut,
  RotateCcw,
  Users,
  Database,
  Activity,
  Shield
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';

export default function Sidebar({
  currentView,
  setCurrentView,
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  farmerRequests = [],
  handleFooterClick,
  onShowReset
}) {
  const { logout } = useProcurement();
  const isFarmer = currentView === 'farmer';
  const isOfficer = currentView === 'officer';
  const isAdmin = currentView === 'admin';

  if (!isFarmer && !isOfficer && !isAdmin) return null;

  const handleLogout = () => {
    logout();
    if (setCurrentView) setCurrentView('landing');
    setSidebarOpen(false);
  };

  const nav = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-nav">
        {isFarmer && (
          <>
            <div className="sidebar-heading">Farmer Portal</div>
            <button
              className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => nav('dashboard')}
            >
              <LayoutDashboard size={18} /> Home
            </button>
            <button
              className={`nav-link ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => nav('requests')}
            >
              <ClipboardList size={18} /> My Requests ({farmerRequests.length})
            </button>
            <button
              className={`nav-link ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => nav('register')}
            >
              <PlusCircle size={18} /> Register Produce
            </button>
            <button
              className={`nav-link ${activeTab === 'find-centre' ? 'active' : ''}`}
              onClick={() => nav('find-centre')}
            >
              <Search size={18} /> Find Centre
            </button>

            <div className="sidebar-heading">Account &amp; Support</div>
            <button
              className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => nav('profile')}
            >
              <User size={18} /> Profile
            </button>
            <button
              className={`nav-link ${activeTab === 'help' ? 'active' : ''}`}
              onClick={() => nav('help')}
            >
              <HelpCircle size={18} /> Help &amp; Support
            </button>
            <button
              className="nav-link"
              onClick={handleLogout}
              style={{ color: 'var(--danger)' }}
            >
              <LogOut size={18} /> Logout
            </button>
          </>
        )}

        {isOfficer && (
          <>
            <div className="sidebar-heading">Command Console</div>
            <button
              className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => nav('dashboard')}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>

            <div className="sidebar-heading">Operations</div>
            <button
              className={`nav-link ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => nav('requests')}
            >
              <ClipboardList size={18} /> Requests
            </button>
            <button
              className={`nav-link ${activeTab === 'queue-yard' ? 'active' : ''}`}
              onClick={() => nav('queue-yard')}
            >
              <Scale size={18} /> Queue &amp; Yard
            </button>

            <div className="sidebar-heading">Facilities &amp; Planning</div>
            <button
              className={`nav-link ${activeTab === 'facilities' ? 'active' : ''}`}
              onClick={() => nav('facilities')}
            >
              <Building2 size={18} /> Facilities
            </button>
            <button
              className={`nav-link ${activeTab === 'capacity-forecast' ? 'active' : ''}`}
              onClick={() => nav('capacity-forecast')}
            >
              <TrendingUp size={18} /> Capacity &amp; Forecast
            </button>

            <div className="sidebar-heading">Reports &amp; Support</div>
            <button
              className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => nav('analytics')}
            >
              <BarChart3 size={18} /> Analytics &amp; Reports
            </button>
            <button
              className={`nav-link ${activeTab === 'help' ? 'active' : ''}`}
              onClick={() => nav('help')}
            >
              <HelpCircle size={18} /> Officer Guide
            </button>
            <button
              className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => nav('profile')}
            >
              <User size={18} /> Profile
            </button>
            <button
              className="nav-link"
              onClick={handleLogout}
              style={{ color: 'var(--danger)' }}
            >
              <LogOut size={18} /> Logout
            </button>
          </>
        )}

        {isAdmin && (
          <>
            <div className="sidebar-heading">Administration</div>
            <button
              className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => nav('dashboard')}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>

            <div className="sidebar-heading">Management</div>
            <button
              className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => nav('users')}
            >
              <Users size={18} /> User Management
            </button>
            <button
              className={`nav-link ${activeTab === 'facility-management' ? 'active' : ''}`}
              onClick={() => nav('facility-management')}
            >
              <Building2 size={18} /> Facility Management
            </button>
            <button
              className={`nav-link ${activeTab === 'master-data' ? 'active' : ''}`}
              onClick={() => nav('master-data')}
            >
              <Database size={18} /> Master Data
            </button>

            <div className="sidebar-heading">Intelligence</div>
            <button
              className={`nav-link ${activeTab === 'monitoring' ? 'active' : ''}`}
              onClick={() => nav('monitoring')}
            >
              <Activity size={18} /> Procurement Monitoring
            </button>
            <button
              className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => nav('analytics')}
            >
              <BarChart3 size={18} /> Reports &amp; Analytics
            </button>

            <div className="sidebar-heading">Account</div>
            <button
              className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => nav('profile')}
            >
              <Shield size={18} /> Admin Profile
            </button>
            <button
              className={`nav-link ${activeTab === 'help' ? 'active' : ''}`}
              onClick={() => nav('help')}
            >
              <HelpCircle size={18} /> Admin Guide
            </button>
            <button
              className="nav-link"
              onClick={handleLogout}
              style={{ color: 'var(--danger)' }}
            >
              <LogOut size={18} /> Logout
            </button>
          </>
        )}
      </div>

      <div className="sidebar-footer">
        <button
          className="btn btn-outline btn-xs w-full flex-align justify-center"
          style={{ fontSize: '12px', color: 'var(--text-muted)', borderColor: 'var(--border)', marginBottom: '6px' }}
          onClick={onShowReset || handleFooterClick}
          title="Reset all application data to defaults"
        >
          <RotateCcw size={13} style={{ marginRight: '6px' }} /> Reset Application Data
        </button>
        <div
          style={{
            textAlign: 'center',
            fontSize: '12px',
            color: 'var(--text-muted)',
            userSelect: 'none',
            cursor: 'default'
          }}
        >
          SmartProcure | TN Procurement Platform
        </div>
      </div>
    </aside>
  );
}
