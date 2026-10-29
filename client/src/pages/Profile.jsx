import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { updateProfile } from '../services/api.js';

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Name cannot be empty.');
      return;
    }

    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters long.');
      return;
    }

    if (trimmedName === user?.name) {
      setError('No changes detected in your name.');
      return;
    }

    try {
      setLoading(true);
      const res = await updateProfile({ name: trimmedName });
      if (res.success && res.user) {
        updateUser(res.user);
        setSuccess('Profile updated successfully!');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="page-header" style={{ textAlign: 'center' }}>
          <h1 className="page-title">Manage Your Profile</h1>
          <p className="page-subtitle">View and update your personal account information</p>
        </div>

        <div className="form-card">
          {success && (
            <div className="alert alert-success" role="alert">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="alert alert-error" role="alert">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Full Name (Editable)
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {/* Email Address (Read-Only) */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address (Protected Field)
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
              />
              <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                Email cannot be modified to protect account identity.
              </span>
            </div>

            {/* Account Role (Read-Only) */}
            <div className="form-group">
              <label className="form-label">
                Account Role (Protected Field)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span className="badge badge-primary">{user?.role || 'user'}</span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Role modification is restricted on the backend.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
              <Link to="/dashboard" className="btn btn-secondary">
                Back to Dashboard
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
