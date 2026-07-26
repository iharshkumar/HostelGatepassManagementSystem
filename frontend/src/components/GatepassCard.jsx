import React from 'react';
import { Calendar, MapPin, FileText, CheckCircle, XCircle, Ban, Clock } from 'lucide-react';

export const GatepassCard = ({ gatepass, userRole, onApprove, onReject, onCancel }) => {
  const getBadgeClass = (status) => {
    switch (status) {
      case 'Approved':
        return 'badge-approved';
      case 'Rejected':
        return 'badge-rejected';
      case 'Cancelled':
        return 'badge-cancelled';
      default:
        return 'badge-pending';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="glass-card" style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>
            {gatepass.studentName || 'Student'}
          </h4>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            {gatepass.hostel ? `${gatepass.hostel} - Room ${gatepass.roomNumber}` : 'Hostel Unassigned'}
          </span>
        </div>
        <span className={`badge ${getBadgeClass(gatepass.status)}`}>{gatepass.status}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={16} color="#6366f1" />
          <span><strong>Destination:</strong> {gatepass.destination}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} color="#10b981" />
          <span><strong>Out:</strong> {formatDate(gatepass.leaveDate)}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} color="#f59e0b" />
          <span><strong>Return:</strong> {formatDate(gatepass.returnDate)}</span>
        </div>
      </div>

      <div style={{ fontSize: '0.875rem', color: '#94a3b8', background: 'rgba(15, 23, 42, 0.4)', padding: '0.75rem', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: '#cbd5e1' }}>
          <FileText size={14} /> <strong>Reason:</strong>
        </div>
        <p>{gatepass.reason}</p>
        {gatepass.remarks && (
          <p style={{ marginTop: '6px', color: '#fbbf24', fontSize: '0.8rem' }}>
            <strong>Warden Remarks:</strong> {gatepass.remarks}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {userRole === 'Student' && gatepass.status === 'Pending' && onCancel && (
          <button onClick={() => onCancel(gatepass.id)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            <Ban size={14} /> Cancel Request
          </button>
        )}

        {(userRole === 'Warden' || userRole === 'Admin') && gatepass.status === 'Pending' && (
          <>
            {onReject && (
              <button onClick={() => onReject(gatepass)} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                <XCircle size={14} /> Reject
              </button>
            )}
            {onApprove && (
              <button onClick={() => onApprove(gatepass)} className="btn btn-success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                <CheckCircle size={14} /> Approve
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
