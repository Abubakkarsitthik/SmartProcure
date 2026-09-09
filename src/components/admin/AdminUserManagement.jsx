import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Users, Search, UserCheck, UserX, Shield, ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminUserManagement() {
  const { farmers, officers, toggleUserStatus } = useProcurement();
  const [activeUserTab, setActiveUserTab] = useState('farmers');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedUser, setExpandedUser] = useState(null);

  const filteredFarmers = farmers.filter(f => {
    if (statusFilter !== 'All' && (f.status || 'Active') !== statusFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (f.name || '').toLowerCase().includes(term)
        || (f.id || '').toLowerCase().includes(term)
        || (f.mobile || '').includes(term)
        || (f.district || '').toLowerCase().includes(term);
    }
    return true;
  });

  const filteredOfficers = officers.filter(o => {
    if (statusFilter !== 'All' && o.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (o.name || '').toLowerCase().includes(term)
        || (o.officerId || '').toLowerCase().includes(term)
        || (o.mobile || '').includes(term)
        || (o.district || '').toLowerCase().includes(term)
        || (o.assignedCentre || '').toLowerCase().includes(term);
    }
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">User Management</h2>
        <p className="page-subtitle">View and manage registered Farmers and Procurement Officers.</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex-gap mb-4">
        <button
          className={`btn ${activeUserTab === 'farmers' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => { setActiveUserTab('farmers'); setSearchTerm(''); setStatusFilter('All'); }}
        >
          <Users size={14} /> Farmers ({farmers.length})
        </button>
        <button
          className={`btn ${activeUserTab === 'officers' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => { setActiveUserTab('officers'); setSearchTerm(''); setStatusFilter('All'); }}
        >
          <Shield size={14} /> Procurement Officers ({officers.length})
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="card mb-4 p-4">
        <div className="grid-2col" style={{ gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} className="text-muted" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              className="form-input text-sm"
              placeholder={activeUserTab === 'farmers' ? 'Search by name, ID, mobile, or district...' : 'Search by name, officer ID, centre...'}
              style={{ paddingLeft: '32px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="form-select text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Farmers List */}
      {activeUserTab === 'farmers' && (
        <div className="card">
          <h3 className="card-title"><Users size={18} className="text-green-600" /> Registered Farmers ({filteredFarmers.length})</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Farmer ID</th>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Village</th>
                  <th>District</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFarmers.map(f => (
                  <React.Fragment key={f.id}>
                    <tr>
                      <td className="font-mono font-semibold text-xs">{f.id}</td>
                      <td className="font-medium">{f.name}</td>
                      <td className="font-mono text-xs">{f.mobile}</td>
                      <td>{f.village || '—'}</td>
                      <td>{f.district}</td>
                      <td>
                        <span className={`badge text-xs ${(f.status || 'Active') === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                          {f.status || 'Active'}
                        </span>
                      </td>
                      <td>
                        <div className="flex-gap">
                          <button
                            className="btn btn-outline btn-xs"
                            onClick={() => setExpandedUser(expandedUser === f.id ? null : f.id)}
                          >
                            {expandedUser === f.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                          <button
                            className={`btn btn-xs ${(f.status || 'Active') === 'Active' ? 'btn-danger' : 'btn-secondary'}`}
                            onClick={() => toggleUserStatus(f.id, 'farmer')}
                          >
                            {(f.status || 'Active') === 'Active' ? <><UserX size={12} /> Deactivate</> : <><UserCheck size={12} /> Activate</>}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedUser === f.id && (
                      <tr>
                        <td colSpan="7">
                          <div className="p-3 bg-slate-50 rounded text-sm space-y-1">
                            <div><span className="text-muted font-medium">State:</span> {f.state || 'Tamil Nadu'}</div>
                            <div><span className="text-muted font-medium">Language:</span> {f.language || 'Tamil'}</div>
                            <div><span className="text-muted font-medium">Role:</span> Farmer</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {filteredFarmers.length === 0 && (
            <p className="text-sm text-muted text-center p-4">No farmers match the current filters.</p>
          )}
        </div>
      )}

      {/* Officers List */}
      {activeUserTab === 'officers' && (
        <div className="card">
          <h3 className="card-title"><Shield size={18} className="text-blue-600" /> Procurement Officers ({filteredOfficers.length})</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Officer ID</th>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>District</th>
                  <th>Assigned Centre</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOfficers.map(o => (
                  <React.Fragment key={o.id}>
                    <tr>
                      <td className="font-mono font-semibold text-xs">{o.officerId}</td>
                      <td className="font-medium">{o.name}</td>
                      <td className="font-mono text-xs">{o.mobile}</td>
                      <td>{o.district}</td>
                      <td className="text-xs">{o.assignedCentre || '—'}</td>
                      <td>
                        <span className={`badge text-xs ${o.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                          {o.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex-gap">
                          <button
                            className="btn btn-outline btn-xs"
                            onClick={() => setExpandedUser(expandedUser === o.id ? null : o.id)}
                          >
                            {expandedUser === o.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                          <button
                            className={`btn btn-xs ${o.status === 'Active' ? 'btn-danger' : 'btn-secondary'}`}
                            onClick={() => toggleUserStatus(o.id, 'officer')}
                          >
                            {o.status === 'Active' ? <><UserX size={12} /> Deactivate</> : <><UserCheck size={12} /> Activate</>}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedUser === o.id && (
                      <tr>
                        <td colSpan="7">
                          <div className="p-3 bg-slate-50 rounded text-sm space-y-1">
                            <div><span className="text-muted font-medium">System ID:</span> {o.id}</div>
                            <div><span className="text-muted font-medium">State:</span> {o.state || 'Tamil Nadu'}</div>
                            <div><span className="text-muted font-medium">Join Date:</span> {o.joinDate || '—'}</div>
                            <div><span className="text-muted font-medium">Assigned Centre ID:</span> {o.assignedCentreId || '—'}</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {filteredOfficers.length === 0 && (
            <p className="text-sm text-muted text-center p-4">No officers match the current filters.</p>
          )}
        </div>
      )}
    </div>
  );
}
