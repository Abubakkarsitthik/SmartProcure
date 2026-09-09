import React from 'react';

export default function NotificationDropdown({ notifications, onClose, onMarkRead }) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notif-dropdown">
      <div className="notif-header">
        <span>Procurement Notifications</span>
        <button 
          className="btn btn-outline btn-xs" 
          onClick={() => {
            onMarkRead();
            onClose();
          }}
        >
          Mark Read
        </button>
      </div>
      <div className="notif-list">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted">No notifications.</div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`}>
              <div className="notif-item-text">{n.text}</div>
              <div className="notif-item-time">{n.timestamp}</div>
            </div>
          ))
        )}
      </div>
      <div className="notif-footer">
        <span className="text-xs text-muted">Smart Procurement Assistance ({unreadCount} unread)</span>
      </div>
    </div>
  );
}
