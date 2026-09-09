import React, { useState, useEffect } from 'react';
import { useProcurement } from './context/ProcurementContext';

// Common components
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import MobileBottomNav from './components/common/MobileBottomNav';

// Landing & Login
import LandingPage from './components/landing/LandingPage';
import LoginPage from './components/landing/LoginPage';

// Farmer views
import FarmerDashboard from './components/farmer/FarmerDashboard';
import RegisterProduce from './components/farmer/RegisterProduce';
import MyRequests from './components/farmer/MyRequests';
import FindFacility from './components/farmer/FindFacility';
import FarmerProfile from './components/farmer/FarmerProfile';
import FarmerHelp from './components/farmer/FarmerHelp';

// Officer views
import OfficerDashboard from './components/officer/OfficerDashboard';
import FarmerRequestsReview from './components/officer/FarmerRequestsReview';
import FacilityManagement from './components/officer/FacilityManagement';
import QueueAndYard from './components/officer/QueueAndYard';
import CapacityAndForecast from './components/officer/CapacityAndForecast';
import AnalyticsReports from './components/officer/AnalyticsReports';
import OfficerProfile from './components/officer/OfficerProfile';
import OfficerHelp from './components/officer/OfficerHelp';

// Modals
import ResetModal from './components/modals/ResetModal';
import RejectModal from './components/modals/RejectModal';
import SupportModal from './components/modals/SupportModal';

// Admin views
import AdminDashboard from './components/admin/AdminDashboard';
import AdminUserManagement from './components/admin/AdminUserManagement';
import AdminMasterData from './components/admin/AdminMasterData';
import AdminMonitoring from './components/admin/AdminMonitoring';
import AdminProfile from './components/admin/AdminProfile';
import AdminHelp from './components/admin/AdminHelp';

export default function App() {
  const {
    currentUser,
    requests,
    rejectRequest,
    resetDemo
  } = useProcurement();

  // Navigation states — derive initial view from persisted user
  const [currentView, setCurrentView] = useState(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') return 'admin';
      return currentUser.role === 'farmer' ? 'farmer' : 'officer';
    }
    return 'landing';
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals state
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingRequest, setRejectingRequest] = useState(null);

  const [selectedFarmerRequest, setSelectedFarmerRequest] = useState(null);
  const clickCounterRef = React.useRef(0);

  // Sync currentView whenever currentUser changes (e.g. after logout)
  useEffect(() => {
    if (!currentUser) {
      setCurrentView('landing');
      setActiveTab('dashboard');
    } else if (currentUser.role === 'farmer' && currentView === 'landing') {
      setCurrentView('farmer');
    } else if (currentUser.role === 'officer' && currentView === 'landing') {
      setCurrentView('officer');
    } else if (currentUser.role === 'admin' && currentView === 'landing') {
      setCurrentView('admin');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Handle footer click for hidden reset trigger (5-click easter egg)
  const handleFooterClick = () => {
    clickCounterRef.current += 1;
    if (clickCounterRef.current >= 5) {
      setShowResetModal(true);
      clickCounterRef.current = 0;
    }
  };

  const handleOpenRejectModal = (request) => {
    setRejectingRequest(request);
    setShowRejectModal(true);
  };

  const handleConfirmReject = (requestId, reason) => {
    rejectRequest(requestId, reason);
    setShowRejectModal(false);
    setRejectingRequest(null);
  };

  // Farmer request filters
  const farmerRequests = currentUser?.role === 'farmer'
    ? requests.filter(r => r.farmerId === currentUser.id)
    : [];

  return (
    <div className="app-container">
      {/* Navbar Header */}
      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* Main Layout Body */}
      <div className="main-layout">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          farmerRequests={farmerRequests}
          handleFooterClick={handleFooterClick}
          onShowReset={() => setShowResetModal(true)}
        />

        {/* Content Area View Router */}
        <main className={`content-area w-full ${currentView === 'farmer' ? 'has-bottom-nav' : ''}`}>
          {/* LANDING PAGE */}
          {currentView === 'landing' && (
            <LandingPage
              onFarmerAccess={() => setCurrentView('login')}
              onOfficerAccess={() => setCurrentView('login')}
            />
          )}

          {/* LOGIN SCREEN */}
          {currentView === 'login' && (
            <LoginPage setCurrentView={setCurrentView} />
          )}

          {/* FARMER VIEWS */}
          {currentView === 'farmer' && (
            <>
              {activeTab === 'dashboard' && (
                <FarmerDashboard
                  setActiveTab={setActiveTab}
                  onSelectRequest={(req) => setSelectedFarmerRequest(req)}
                />
              )}
              {activeTab === 'register' && <RegisterProduce setActiveTab={setActiveTab} />}
              {(activeTab === 'requests' || activeTab === 'appointment' || activeTab === 'queue' || activeTab === 'status' || activeTab === 'payment') && (
                <MyRequests
                  initialSelectedRequest={selectedFarmerRequest}
                  onBackToDashboard={() => setActiveTab('dashboard')}
                />
              )}
              {activeTab === 'find-centre' && <FindFacility />}
              {activeTab === 'profile' && <FarmerProfile />}
              {activeTab === 'help' && <FarmerHelp onContactSupport={() => setShowSupportModal(true)} />}
            </>
          )}

          {/* OFFICER VIEWS */}
          {currentView === 'officer' && (
            <>
              {activeTab === 'dashboard' && <OfficerDashboard setActiveTab={setActiveTab} />}
              {activeTab === 'requests' && (
                <FarmerRequestsReview
                  onOpenRejectModal={handleOpenRejectModal}
                  setActiveTab={setActiveTab}
                />
              )}
              {(activeTab === 'facilities' || activeTab === 'facility-management') && (
                <FacilityManagement />
              )}
              {(activeTab === 'queue-yard' || activeTab === 'queues' || activeTab === 'processing') && (
                <QueueAndYard />
              )}
              {(activeTab === 'capacity-forecast' || activeTab === 'capacity' || activeTab === 'forecast' || activeTab === 'comparison') && (
                <CapacityAndForecast />
              )}
              {activeTab === 'analytics' && <AnalyticsReports />}
              {activeTab === 'profile' && <OfficerProfile />}
              {activeTab === 'help' && <OfficerHelp />}
            </>
          )}

          {/* ADMIN VIEWS */}
          {currentView === 'admin' && (
            <>
              {activeTab === 'dashboard' && <AdminDashboard setActiveTab={setActiveTab} />}
              {activeTab === 'users' && <AdminUserManagement />}
              {(activeTab === 'facility-management' || activeTab === 'facilities') && <FacilityManagement />}
              {activeTab === 'master-data' && <AdminMasterData />}
              {activeTab === 'monitoring' && <AdminMonitoring />}
              {activeTab === 'analytics' && <AnalyticsReports />}
              {activeTab === 'profile' && <AdminProfile />}
              {activeTab === 'help' && <AdminHelp />}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation for Farmers */}
      {currentView === 'farmer' && (
        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          requestsCount={farmerRequests.length}
        />
      )}

      {/* Modals */}
      <ResetModal
        show={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={() => {
          resetDemo();
          setShowResetModal(false);
          setCurrentView('landing');
          setActiveTab('dashboard');
        }}
      />

      <RejectModal
        show={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectingRequest(null);
        }}
        onConfirm={handleConfirmReject}
        requestId={rejectingRequest?.id || ''}
      />

      <SupportModal
        show={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        mobile={currentUser?.mobile}
      />
    </div>
  );
}
