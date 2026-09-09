import React from 'react';
import { LayoutDashboard, ClipboardList, PlusCircle, Search } from 'lucide-react';

export default function MobileBottomNav({ activeTab, setActiveTab, requestsCount = 0 }) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'requests', label: 'Requests', icon: ClipboardList, badge: requestsCount },
    { id: 'register', label: 'Register', icon: PlusCircle },
    { id: 'find-centre', label: 'Centres', icon: Search }
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            aria-label={tab.label}
          >
            <div className="mobile-nav-icon-wrap">
              <Icon size={20} />
              {Boolean(tab.badge && tab.badge > 0) && (
                <span className="mobile-nav-badge">{tab.badge}</span>
              )}
            </div>
            <span className="mobile-nav-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
