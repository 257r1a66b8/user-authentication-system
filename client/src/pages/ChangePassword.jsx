import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { changePassword } from '../services/api.js';

const ChangePassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.currentPassword) {
      errs.currentPassword = 'Current password is required.';
    }

    if (!formData.newPassword) {
      errs.newPassword = 'New password is required.';
    } else if (formData.newPassword.length < 8) {
      errs.newPassword = 'New password must be at least 8 characters long.';
    }

    if (!formData.confirmNewPassword) {
      errs.confirmNewPassword = 'Confirmation password is required.';
    } else if (formData.newPassword !== formData.confirmNewPassword) {
      errs.confirmNewPassword = 'New passwords do not match.';
    }

    if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
      errs.newPassword = 'New password must be different from current password.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccess('');

    if (!validate()) return;

    try {
      setLoading(true);
      const res = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      setSuccess(res.message || 'Password changed successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
    } catch (err) {
      setApiError(err.message || 'Failed to update password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="page-header" style={{ textAlign: 'center' }}>
          <h1 className="page-title">Change Password</h1>
          <p className="page-subtitle">Update your account credentials to keep your session secure</p>
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

          {apiError && (
            <div className="alert alert-error" role="alert">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Current Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="currentPassword">
                Current Password
              </label>
              <div className="input-wrapper">
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  className={`form-input ${errors.currentPassword ? 'input-error' : ''}`}
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowCurrent(!showCurrent)}
                  aria-label="Toggle current password visibility"
                >
                  {showCurrent ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.currentPassword && (
                <span className="inline-error">{errors.currentPassword}</span>
              )}
            </div>

            {/* New Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">
                New Password (Min 8 characters)
              </label>
              <div className="input-wrapper">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNew ? 'text' : 'password'}
                  className={`form-input ${errors.newPassword ? 'input-error' : ''}`}
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowNew(!showNew)}
                  aria-label="Toggle new password visibility"
                >
                  {showNew ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.newPassword && (
                <span className="inline-error">{errors.newPassword}</span>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="confirmNewPassword">
                Confirm New Password
              </label>
              <div className="input-wrapper">
                <input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type={showConfirm ? 'text' : 'password'}
                  className={`form-input ${errors.confirmNewPassword ? 'input-error' : ''}`}
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label="Toggle confirm new password visibility"
                >
                  {showConfirm ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.confirmNewPassword && (
                <span className="inline-error">{errors.confirmNewPassword}</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Verifying & Updating...' : 'Update Password'}
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

export default ChangePassword;
