import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getMe } from '../services/api.js';
import Loading from '../components/Loading.jsx';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Re-verify session live with protected backend /api/auth/me
    const fetchLatestProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getMe();
        if (res.success && res.user) {
          setProfileData(res.user);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch updated profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProfile();
  }, []);

  const handleLogout = async () => {
    if (window.confirm('Do you want to log out of your session?')) {
      try {
        setLoggingOut(true);
        await logout();
        navigate('/login');
      } catch (err) {
        console.error(err);
      } finally {
        setLoggingOut(false);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Active Session';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !profileData) {
    return <Loading message="Loading your protected dashboard data..." />;
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Welcome Header */}
        <div className="page-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 className="page-title">
                Welcome back, {profileData?.name || 'Student'}! 👋
              </h1>
              <p className="page-subtitle">
                You are securely authenticated using a signed JSON Web Token stored in an HttpOnly cookie.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-outline-danger"
              disabled={loggingOut}
            >
              {loggingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            <span>{error}</span>
          </div>
        )}

        {/* Security Notification Banner */}
        <div className="security-status-box">
          <div className="security-status-icon">🛡️</div>
          <div>
            <div className="security-status-title">Active HttpOnly Cookie Session</div>
            <div className="security-status-desc">
              Your session token is protected against Cross-Site Scripting (XSS). Frontend JavaScript
              cannot read the token cookie directly. Refreshing this page maintains your secure session seamlessly.
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* User Details Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                Account Information
              </div>
              <span className="badge badge-success">Active</span>
            </div>

            <div className="profile-field-list">
              <div className="profile-field-item">
                <span className="field-label">Full Name</span>
                <span className="field-value">{profileData?.name || 'N/A'}</span>
              </div>

              <div className="profile-field-item">
                <span className="field-label">Email Address</span>
                <span className="field-value">{profileData?.email || 'N/A'}</span>
              </div>

              <div className="profile-field-item">
                <span className="field-label">Account Role</span>
                <span className="field-value">
                  <span className="badge badge-primary">{profileData?.role || 'user'}</span>
                </span>
              </div>

              <div className="profile-field-item">
                <span className="field-label">Member Since</span>
                <span className="field-value">{formatDate(profileData?.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                </div>
                Account Management
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
              Choose an action to test role restrictions, password updating, or profile management.
            </p>

            <div className="action-card-grid">
              <Link to="/profile" className="quick-action-btn">
                <span className="quick-action-icon">✏️</span>
                <span className="quick-action-title">Edit Profile</span>
                <span className="quick-action-desc">Update your display name</span>
              </Link>

              <Link to="/change-password" className="quick-action-btn">
                <span className="quick-action-icon">🔑</span>
                <span className="quick-action-title">Change Password</span>
                <span className="quick-action-desc">Update security credentials</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
