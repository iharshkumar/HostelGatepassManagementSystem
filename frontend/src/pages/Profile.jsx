import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { Toast } from '../components/Toast';
import { User, KeyRound, Save } from 'lucide-react';

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    hostel: user?.hostel || '',
    roomNumber: user?.roomNumber || '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      if (user.role === 'Student') {
        await axiosClient.put('/student/profile', profileData);
      }
      updateUser(profileData);
      setToast({ message: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to update profile', type: 'error' });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setToast({ message: 'New passwords do not match', type: 'error' });
      return;
    }

    setLoadingPassword(true);
    try {
      const res = await axiosClient.put('/auth/update-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      if (res.success) {
        setToast({ message: 'Password updated successfully!', type: 'success' });
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to update password', type: 'error' });
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>Account & Security Settings</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        {/* Profile Card */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <User size={22} color="#6366f1" />
            <h3 style={{ fontSize: '1.2rem' }}>Personal Profile</h3>
          </div>

          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input type="email" value={user?.email || ''} disabled className="form-control" style={{ opacity: 0.6 }} />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="form-control"
              />
            </div>

            {user?.role === 'Student' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Hostel</label>
                  <input
                    type="text"
                    value={profileData.hostel}
                    onChange={(e) => setProfileData({ ...profileData, hostel: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Room Number</label>
                  <input
                    type="text"
                    value={profileData.roomNumber}
                    onChange={(e) => setProfileData({ ...profileData, roomNumber: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loadingProfile} style={{ width: '100%', marginTop: '1rem' }}>
              <Save size={16} /> Save Profile
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <KeyRound size={22} color="#f59e0b" />
            <h3 style={{ fontSize: '1.2rem' }}>Change Password</h3>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                required
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="form-control"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loadingPassword} style={{ width: '100%', marginTop: '1rem' }}>
              <KeyRound size={16} /> Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
