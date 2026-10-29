import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out of your session?')) {
      try {
        setLoggingOut(true);
        await logout();
        navigate('/login');
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        setLoggingOut(false);
      }
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-brand">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: '#4f46e5' }}
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <div>
            <span>Auth</span>System
          </div>
        </Link>

        <nav className="nav-links">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            end
          >
            Home
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                Profile
              </NavLink>
              <NavLink
                to="/change-password"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                Change Password
              </NavLink>

              <div className="nav-user">
                <div className="user-avatar" title={user?.name}>
                  {getInitials(user?.name)}
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-danger"
                  style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                  disabled={loggingOut}
                >
                  {loggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                Login
              </NavLink>
              <Link to="/register" className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '0.88rem' }}>
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
