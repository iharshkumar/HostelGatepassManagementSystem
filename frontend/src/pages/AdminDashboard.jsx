import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { StatCard } from '../components/StatCard';
import { Toast } from '../components/Toast';
import { Users, Building2, Shield, Trash2, Plus, FileText, CheckCircle2, Clock } from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'hostels'
  const [loading, setLoading] = useState(true);
  const [showHostelModal, setShowHostelModal] = useState(false);
  const [newHostel, setNewHostel] = useState({ hostelName: '', wardenName: '', capacity: 100 });
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, hostelsRes] = await Promise.all([
        axiosClient.get('/admin/stats'),
        axiosClient.get('/admin/users'),
        axiosClient.get('/admin/hostels'),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (usersRes.success) setUsers(usersRes.data);
      if (hostelsRes.success) setHostels(hostelsRes.data);
    } catch (err) {
      setToast({ message: err.message || 'Failed to load admin data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await axiosClient.put(`/admin/users/${userId}/role`, { role: newRole });
      if (res.success) {
        setToast({ message: `Role updated to ${newRole}`, type: 'success' });
        fetchData();
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to update role', type: 'error' });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await axiosClient.delete(`/admin/users/${userId}`);
      if (res.success) {
        setToast({ message: 'User deleted successfully', type: 'success' });
        fetchData();
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to delete user', type: 'error' });
    }
  };

  const handleCreateHostel = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post('/admin/hostels', newHostel);
      if (res.success) {
        setToast({ message: 'Hostel created successfully', type: 'success' });
        setShowHostelModal(false);
        setNewHostel({ hostelName: '', wardenName: '', capacity: 100 });
        fetchData();
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to create hostel', type: 'error' });
    }
  };

  return (
    <div className="container">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>System Admin Dashboard</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Hostel management, user accounts, and system analytics</p>
      </div>

      {/* Metrics */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <StatCard title="Total Students" value={stats.totalStudents || 0} icon={Users} color="#6366f1" />
          <StatCard title="Total Wardens" value={stats.totalWardens || 0} icon={Shield} color="#f59e0b" />
          <StatCard title="Total Requests" value={stats.totalRequests || 0} icon={FileText} color="#3b82f6" />
          <StatCard title="Pending Passes" value={stats.pendingRequests || 0} icon={Clock} color="#eab308" />
          <StatCard title="Approved Passes" value={stats.approvedRequests || 0} icon={CheckCircle2} color="#10b981" />
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('users')}
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Users size={16} /> User Management
        </button>
        <button
          onClick={() => setActiveTab('hostels')}
          className={`btn ${activeTab === 'hostels' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Building2 size={16} /> Hostel Management
        </button>
      </div>

      {/* User Management */}
      {activeTab === 'users' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>User Accounts ({users.length})</h3>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Hostel / Room</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                    <td style={{ color: '#94a3b8' }}>{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="form-control"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem', width: 'auto' }}
                      >
                        <option value="Student">Student</option>
                        <option value="Warden">Warden</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ color: '#cbd5e1' }}>{u.hostel ? `${u.hostel} (${u.roomNumber || 'N/A'})` : '—'}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="btn btn-danger"
                        style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hostel Management */}
      {activeTab === 'hostels' && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem' }}>Hostels ({hostels.length})</h3>
            <button onClick={() => setShowHostelModal(true)} className="btn btn-primary">
              <Plus size={16} /> Add Hostel
            </button>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Hostel Name</th>
                  <th>Warden</th>
                  <th>Capacity</th>
                  <th>Occupied Rooms</th>
                </tr>
              </thead>
              <tbody>
                {hostels.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8' }}>
                      No hostels registered yet.
                    </td>
                  </tr>
                ) : (
                  hostels.map((h) => (
                    <tr key={h.id}>
                      <td style={{ fontWeight: 600 }}>{h.hostelName}</td>
                      <td>{h.wardenName}</td>
                      <td>{h.capacity}</td>
                      <td>{h.occupiedRooms || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Hostel Modal */}
      {showHostelModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Add New Hostel</h3>
            <form onSubmit={handleCreateHostel}>
              <div className="form-group">
                <label className="form-label">Hostel Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Block A (Boys)"
                  value={newHostel.hostelName}
                  onChange={(e) => setNewHostel({ ...newHostel, hostelName: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Warden Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ramesh Verma"
                  value={newHostel.wardenName}
                  onChange={(e) => setNewHostel({ ...newHostel, wardenName: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Room Capacity</label>
                <input
                  type="number"
                  required
                  min={10}
                  value={newHostel.capacity}
                  onChange={(e) => setNewHostel({ ...newHostel, capacity: e.target.value })}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowHostelModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Hostel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
