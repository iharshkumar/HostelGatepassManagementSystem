import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { Toast } from '../components/Toast';
import { 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  Search, 
  Filter, 
  Clock, 
  User, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Building
} from 'lucide-react';

export const SecurityDashboard = () => {
  const [gatepasses, setGatepasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchGatepasses = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/gatepass');
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
  }, []);

  const handleCheckOut = async (gatepassId) => {
    try {
      setActionLoadingId(gatepassId);
      const res = await axiosClient.put(`/gatepass/${gatepassId}/check-out`);
      if (res.success) {
        setToast({ message: 'Student successfully checked out!', type: 'success' });
        fetchGatepasses();
      }
    } catch (err) {
      setToast({ message: err.message || 'Check out failed', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCheckIn = async (gatepassId) => {
    try {
      setActionLoadingId(gatepassId);
      const res = await axiosClient.put(`/gatepass/${gatepassId}/check-in`);
      if (res.success) {
        setToast({ message: 'Student successfully checked in!', type: 'success' });
        fetchGatepasses();
      }
    } catch (err) {
      setToast({ message: err.message || 'Check in failed', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter gatepasses by search & tab filter
  const filteredPasses = gatepasses.filter((gp) => {
    const matchesSearch =
      !searchTerm ||
      (gp.studentName && gp.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (gp.hostel && gp.hostel.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (gp.roomNumber && gp.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (gp.destination && gp.destination.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (gp.reason && gp.reason.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (gp.id && gp.id.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'All') return true;
    if (statusFilter === 'ReadyForOut') return gp.status === 'Approved';
    if (statusFilter === 'CheckedOut') return gp.status === 'Checked Out';
    if (statusFilter === 'CheckedIn') return gp.status === 'Checked In';
    return gp.status === statusFilter;
  });

  // Calculate statistics
  const totalCount = gatepasses.length;
  const approvedCount = gatepasses.filter((p) => p.status === 'Approved').length;
  const checkedOutCount = gatepasses.filter((p) => p.status === 'Checked Out').length;
  const checkedInCount = gatepasses.filter((p) => p.status === 'Checked In').length;

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header Banner */}
      <div className="glass-card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)' }}>
            <ShieldCheck size={30} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Security Guard Desk
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
              Hostel Entrance Verification & Gate Check In / Check Out Station
            </p>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={fetchGatepasses} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} /> Refresh Gate Log
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ borderLeft: '4px solid #6366f1' }}>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Passes</p>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', margin: '0.25rem 0 0 0' }}>{totalCount}</h2>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid #10b981' }}>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ready For Check Out</p>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', margin: '0.25rem 0 0 0' }}>{approvedCount}</h2>
          <span style={{ fontSize: '0.75rem', color: '#6ee7b7' }}>Approved by Warden</span>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Currently Checked Out</p>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', margin: '0.25rem 0 0 0' }}>{checkedOutCount}</h2>
          <span style={{ fontSize: '0.75rem', color: '#fcd34d' }}>Students Outside Hostel</span>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Checked In / Returned</p>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#60a5fa', margin: '0.25rem 0 0 0' }}>{checkedInCount}</h2>
          <span style={{ fontSize: '0.75rem', color: '#93c5fd' }}>Back in Hostel</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search by student name, hostel, room, or gatepass ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {[
              { id: 'All', label: `All (${totalCount})` },
              { id: 'ReadyForOut', label: `Approved / Ready for Exit (${approvedCount})` },
              { id: 'CheckedOut', label: `Checked Out (${checkedOutCount})` },
              { id: 'CheckedIn', label: `Checked In (${checkedInCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: statusFilter === tab.id ? '#10b981' : 'rgba(15, 23, 42, 0.5)',
                  color: statusFilter === tab.id ? '#ffffff' : '#94a3b8',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gatepasses Grid / List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <Clock size={32} className="animate-spin" style={{ marginBottom: '1rem' }} />
          <p>Loading gatepass entries...</p>
        </div>
      ) : filteredPasses.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <FileText size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
          <h3>No Gatepass Records Found</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            No records matched your search or status filter criteria.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {filteredPasses.map((gp) => {
            const isApproved = gp.status === 'Approved';
            const isCheckedOut = gp.status === 'Checked Out';
            const isCheckedIn = gp.status === 'Checked In';

            let statusBg = 'rgba(148, 163, 184, 0.15)';
            let statusColor = '#94a3b8';
            let statusBorder = 'rgba(148, 163, 184, 0.3)';

            if (isApproved) {
              statusBg = 'rgba(16, 185, 129, 0.15)';
              statusColor = '#34d399';
              statusBorder = 'rgba(16, 185, 129, 0.3)';
            } else if (isCheckedOut) {
              statusBg = 'rgba(245, 158, 11, 0.15)';
              statusColor = '#fbbf24';
              statusBorder = 'rgba(245, 158, 11, 0.3)';
            } else if (isCheckedIn) {
              statusBg = 'rgba(59, 130, 246, 0.15)';
              statusColor = '#60a5fa';
              statusBorder = 'rgba(59, 130, 246, 0.3)';
            } else if (gp.status === 'Rejected') {
              statusBg = 'rgba(239, 68, 68, 0.15)';
              statusColor = '#f87171';
              statusBorder = 'rgba(239, 68, 68, 0.3)';
            }

            return (
              <div
                key={gp.id || gp._id}
                className="glass-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  border: isApproved ? '1px solid rgba(16, 185, 129, 0.4)' : isCheckedOut ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: isApproved ? '0 4px 20px rgba(16, 185, 129, 0.1)' : isCheckedOut ? '0 4px 20px rgba(245, 158, 11, 0.1)' : 'none',
                }}
              >
                <div>
                  {/* Top Row: Student Name & Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={18} color="#818cf8" />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                          {gp.studentName || 'Student'}
                        </h3>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.25rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                        <Building size={14} />
                        <span>{gp.hostel || 'Hostel'} - Room {gp.roomNumber || 'N/A'}</span>
                      </div>
                    </div>

                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: statusBg,
                        color: statusColor,
                        border: `1px solid ${statusBorder}`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {gp.status}
                    </span>
                  </div>

                  <hr style={{ border: 0, borderTop: '1px solid rgba(255, 255, 255, 0.08)', margin: '0.75rem 0' }} />

                  {/* Pass Info Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}>
                      <MapPin size={16} color="#f43f5e" />
                      <span><strong>Destination:</strong> {gp.destination}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}>
                      <FileText size={16} color="#38bdf8" />
                      <span><strong>Reason:</strong> {gp.reason}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}>
                      <Calendar size={16} color="#fbbf24" />
                      <span><strong>Leave:</strong> {formatDate(gp.leaveDate)}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}>
                      <Calendar size={16} color="#a78bfa" />
                      <span><strong>Return:</strong> {formatDate(gp.returnDate)}</span>
                    </div>

                    {gp.approvedBy && (
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                        Approved by: <strong style={{ color: '#cbd5e1' }}>{gp.approvedBy}</strong>
                      </div>
                    )}

                    {/* Check Out Logs */}
                    {gp.checkOutTime && (
                      <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', color: '#fcd34d', border: '1px solid rgba(245, 158, 11, 0.2)', marginTop: '0.5rem' }}>
                        <LogOut size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        Out: <strong>{formatDate(gp.checkOutTime)}</strong> (Guard: {gp.checkOutBy || 'Security'})
                      </div>
                    )}

                    {/* Check In Logs */}
                    {gp.checkInTime && (
                      <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.2)', marginTop: '0.25rem' }}>
                        <LogIn size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        In: <strong>{formatDate(gp.checkInTime)}</strong> (Guard: {gp.checkInBy || 'Security'})
                      </div>
                    )}
                  </div>
                </div>

                {/* Gate Action Buttons */}
                <div style={{ marginTop: '0.5rem' }}>
                  {isApproved && (
                    <button
                      className="btn"
                      disabled={actionLoadingId === (gp.id || gp._id)}
                      onClick={() => handleCheckOut(gp.id || gp._id)}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#ffffff',
                        fontWeight: 700,
                        padding: '0.65rem',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      <LogOut size={18} />
                      {actionLoadingId === (gp.id || gp._id) ? 'Processing Exit...' : 'CHECK OUT (Student Exit)'}
                    </button>
                  )}

                  {isCheckedOut && (
                    <button
                      className="btn"
                      disabled={actionLoadingId === (gp.id || gp._id)}
                      onClick={() => handleCheckIn(gp.id || gp._id)}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        color: '#ffffff',
                        fontWeight: 700,
                        padding: '0.65rem',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
                      }}
                    >
                      <LogIn size={18} />
                      {actionLoadingId === (gp.id || gp._id) ? 'Processing Entry...' : 'CHECK IN (Student Return)'}
                    </button>
                  )}

                  {isCheckedIn && (
                    <div style={{ textAlign: 'center', padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>
                      <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '6px', color: '#60a5fa' }} />
                      Pass Completed & Closed
                    </div>
                  )}

                  {gp.status === 'Pending' && (
                    <div style={{ textAlign: 'center', padding: '0.5rem', borderRadius: '8px', background: 'rgba(245,158,11,0.08)', color: '#fbbf24', fontSize: '0.85rem' }}>
                      <AlertCircle size={16} style={{ display: 'inline', marginRight: '6px' }} />
                      Awaiting Warden Approval
                    </div>
                  )}

                  {gp.status === 'Rejected' && (
                    <div style={{ textAlign: 'center', padding: '0.5rem', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', color: '#f87171', fontSize: '0.85rem' }}>
                      Gatepass Rejected by Warden
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
