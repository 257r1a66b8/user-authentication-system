import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loading from './Loading.jsx';

/**
 * Route Guard component:
 * 1. Shows a loading spinner while authentication state is being verified against the backend.
 * 2. Redirects unauthenticated users to /login with state preservation.
 * 3. Renders protected child components once verified.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading message="Verifying session security with server..." />;
  }

  if (!isAuthenticated) {
    // Redirect to login page and preserve the attempted URL in navigation state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
