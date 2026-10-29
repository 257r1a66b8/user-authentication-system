import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, loginUser, registerUser, logoutUser } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status on initial app load and refresh
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMe();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      // 401 simply means unauthenticated (guest), not a fatal crash
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    const data = await loginUser({ email, password });
    if (data.success && data.user) {
      setUser(data.user);
    }
    return data;
  };

  const register = async (name, email, password) => {
    const data = await registerUser({ name, email, password });
    if (data.success && data.user) {
      setUser(data.user);
    }
    return data;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    refreshUser: checkAuthStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
