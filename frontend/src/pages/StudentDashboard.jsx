import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { GatepassCard } from '../components/GatepassCard';
import { Toast } from '../components/Toast';
import { Plus, Search, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [gatepasses, setGatepasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const [formData, setFormData] = useState({
    reason: '',
    destination: '',
    leaveDate: '',
    returnDate: '',
  });

  const fetchGatepasses = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filterStatus) queryParams.append('status', filterStatus);
      if (search) queryParams.append('search', search);

      const res = await axiosClient.get(`/student/gatepasses?${queryParams.toString()}`);
      if (res.success) {
        setGatepasses(res.data || []);
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to fetch gatepasses', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGatepasses();
  }, [filterStatus, search]);

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post('/gatepass/apply', formData);
      if (res.success) {
        setToast({ message: 'Gatepass application submitted!', type: 'success' });
        setShowModal(false);
        setFormData({ reason: '', destination: '', leaveDate: '', returnDate: '' });
        fetchGatepasses();
      }
    } catch (err) {
      const msg = err.errors && err.errors.length > 0 ? err.errors.join(', ') : err.message;
      setToast({ message: msg || 'Failed to apply gatepass', type: 'error' });
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this gatepass request?')) return;
    try {
      const res = await axiosClient.put(`/gatepass/${id}/cancel`);
      if (res.success) {
        setToast({ message: 'Gatepass cancelled successfully', type: 'success' });
        fetchGatepasses();
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to cancel gatepass', type: 'error' });
    }
  };

  const pendingCount = gatepasses.filter((g) => g.status === 'Pending').length;
  const approvedCount = gatepasses.filter((g) => g.status === 'Approved').length;
  const rejectedCount = gatepasses.filter((g) => g.status === 'Rejected').length;

  return (
    <div className="container">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header & Apply CTA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Welcome, {user.fullName}!</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Hostel: {user.hostel || 'Unassigned'} | Room: {user.roomNumber || 'N/A'}
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} /> Apply for Gatepass
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard title="Total Requests" value={gatepasses.length} icon={FileText} color="#6366f1" />
        <StatCard title="Pending Approvals" value={pendingCount} icon={Clock} color="#f59e0b" />
        <StatCard title="Approved Pass" value={approvedCount} icon={CheckCircle2} color="#10b981" />
        <StatCard title="Rejected Request" value={rejectedCount} icon={XCircle} color="#ef4444" />
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search destination or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '36px' }}
          />
        </div>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="form-control" style={{ width: '180px' }}>
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Loading gatepass records...</p>
      ) : gatepasses.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <FileText size={48} color="#64748b" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#f8fafc' }}>No Gatepass Requests Found</h3>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Apply for a gatepass or clear filters to view history.</p>
        </div>
      ) : (
        gatepasses.map((gp) => (
          <GatepassCard key={gp.id} gatepass={gp} userRole="Student" onCancel={handleCancel} />
        ))
      )}

      {/* Apply Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Apply New Gatepass</h3>
            <form onSubmit={handleApply}>
              <div className="form-group">
                <label className="form-label">Destination</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Home, City Mall, Railway Station"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Reason</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide reason for leave..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Leave Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.leaveDate}
                  onChange={(e) => setFormData({ ...formData, leaveDate: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Return Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.returnDate}
                  onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Gatepass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
