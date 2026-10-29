import jwt from 'jsonwebtoken';

/**
 * Generate a signed JSON Web Token (JWT)
 * @param {string} userId - The MongoDB User ObjectId
 * @param {string} role - The user role
 * @returns {string} - Signed JWT
 */
export const signToken = (userId, role = 'user') => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }

  return jwt.sign(
    { id: userId, role },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

/**
 * Get cookie options tailored to the environment
 * @returns {object} Express cookie options
 */
export const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const maxAge = parseInt(process.env.COOKIE_MAX_AGE_MS, 10) || 24 * 60 * 60 * 1000;

  return {
    httpOnly: true, // Inaccessible to client-side JavaScript (mitigates XSS)
    secure: isProduction, // HTTPS only in production
    sameSite: isProduction ? 'none' : 'lax', // CSRF protection
    maxAge,
    path: '/'
  };
};

/**
 * Sign token and attach HttpOnly cookie to Express response
 * @param {object} res - Express response object
 * @param {object} user - User document
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Response message
 */
export const sendTokenCookie = (res, user, statusCode = 200, message = 'Success') => {
  const token = signToken(user._id || user.id, user.role);
  const cookieName = process.env.COOKIE_NAME || 'auth_token';
  const options = getCookieOptions();

  res.cookie(cookieName, token, options);

  // Note: We do NOT send the JWT in the JSON response to prevent client-side storage
  return res.status(statusCode).json({
    success: true,
    message,
    user: typeof user.toSafeObject === 'function' ? user.toSafeObject() : {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

/**
 * Clear the authentication cookie on logout
 * @param {object} res - Express response object
 */
export const clearTokenCookie = (res) => {
  const cookieName = process.env.COOKIE_NAME || 'auth_token';
  const isProduction = process.env.NODE_ENV === 'production';

  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/'
  });
};
