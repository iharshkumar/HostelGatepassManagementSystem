import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { GatepassCard } from '../components/GatepassCard';
import { Toast } from '../components/Toast';
import { Search, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';

export const WardenDashboard = () => {
  const { user } = useAuth();
  const [gatepasses, setGatepasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('Pending');
  const [search, setSearch] = useState('');
  const [activeGatepass, setActiveGatepass] = useState(null);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [remarks, setRemarks] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchGatepasses = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filterStatus) queryParams.append('status', filterStatus);
      if (search) queryParams.append('search', search);

      const res = await axiosClient.get(`/gatepass?${queryParams.toString()}`);
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

  const openActionModal = (gp, type) => {
    setActiveGatepass(gp);
    setActionType(type);
    setRemarks('');
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!activeGatepass || !actionType) return;

    try {
      const endpoint = `/gatepass/${activeGatepass.id}/${actionType}`;
      const res = await axiosClient.put(endpoint, { remarks });
      if (res.success) {
        setToast({ message: `Gatepass ${actionType}d successfully`, type: 'success' });
        setActiveGatepass(null);
        fetchGatepasses();
      }
    } catch (err) {
      setToast({ message: err.message || `Failed to ${actionType} gatepass`, type: 'error' });
    }
  };

  const pendingCount = gatepasses.filter((g) => g.status === 'Pending').length;
  const approvedCount = gatepasses.filter((g) => g.status === 'Approved').length;
  const rejectedCount = gatepasses.filter((g) => g.status === 'Rejected').length;

  return (
    <div className="container">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Warden Dashboard</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Review and manage student gatepass applications</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard title="Total Reviewed" value={gatepasses.length} icon={FileText} color="#6366f1" />
        <StatCard title="Pending Requests" value={pendingCount} icon={Clock} color="#f59e0b" />
        <StatCard title="Approved Pass" value={approvedCount} icon={CheckCircle2} color="#10b981" />
        <StatCard title="Rejected Pass" value={rejectedCount} icon={XCircle} color="#ef4444" />
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search student name, destination, reason..."
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
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Loading student gatepasses...</p>
      ) : gatepasses.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <Clock size={48} color="#64748b" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#f8fafc' }}>No Gatepass Applications</h3>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>No gatepass applications match the selected status.</p>
        </div>
      ) : (
        gatepasses.map((gp) => (
          <GatepassCard
            key={gp.id}
            gatepass={gp}
            userRole="Warden"
            onApprove={(g) => openActionModal(g, 'approve')}
            onReject={(g) => openActionModal(g, 'reject')}
          />
        ))
      )}

      {/* Approve/Reject Remarks Modal */}
      {activeGatepass && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', textTransform: 'capitalize' }}>
              {actionType} Gatepass
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Student: <strong>{activeGatepass.studentName}</strong> | Destination: <strong>{activeGatepass.destination}</strong>
            </p>

            <form onSubmit={handleActionSubmit}>
              <div className="form-group">
                <label className="form-label">Warden Remarks / Instructions</label>
                <textarea
                  rows={3}
                  placeholder="Optional remarks (e.g. Return before 8 PM)..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setActiveGatepass(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn ${actionType === 'approve' ? 'btn-success' : 'btn-danger'}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  Confirm {actionType}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
