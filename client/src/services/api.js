/**
 * API Service Layer for communicating with Express Backend
 * Implements fetch with credentials: 'include' for HttpOnly cookie session support
 * and automatically manages CSRF token headers for state-changing requests.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let cachedCsrfToken = null;

/**
 * Fetch or refresh CSRF token from the server
 */
export const getCsrfToken = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/csrf-token`, {
      method: 'GET',
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      cachedCsrfToken = data.csrfToken;
      return cachedCsrfToken;
    }
  } catch (err) {
    console.warn('Unable to pre-fetch CSRF token:', err.message);
  }
  return null;
};

/**
 * Generic fetch wrapper with credentials and error handling
 */
const request = async (endpoint, options = {}) => {
  const method = options.method || 'GET';
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  // Attach CSRF token on state-changing requests
  const stateChanging = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method.toUpperCase());
  if (stateChanging) {
    if (!cachedCsrfToken) {
      await getCsrfToken();
    }
    if (cachedCsrfToken) {
      headers['x-csrf-token'] = cachedCsrfToken;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include' // Crucial: enables HttpOnly cookie exchange across ports
  });

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error(`Server returned status ${response.status} with non-JSON response.`);
  }

  if (!response.ok) {
    const message = data.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.errors = data.errors || null;
    throw error;
  }

  return data;
};

// 1. Health check
export const checkHealth = () => request('/health');

// 2. Authentication endpoints
export const registerUser = ({ name, email, password }) =>
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });

export const loginUser = ({ email, password }) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

export const logoutUser = () =>
  request('/auth/logout', {
    method: 'POST'
  });

export const getMe = () => request('/auth/me');

export const changePassword = ({ currentPassword, newPassword }) =>
  request('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword })
  });

// 3. Profile endpoints
export const getProfile = () => request('/users/profile');

export const updateProfile = ({ name }) =>
  request('/users/profile', {
    method: 'PATCH',
    body: JSON.stringify({ name })
  });
