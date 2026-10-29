import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to protect routes and verify authenticated session
 */
export const protect = async (req, res, next) => {
  try {
    const cookieName = process.env.COOKIE_NAME || 'auth_token';
    let token = null;

    // 1. Extract token from HttpOnly cookie (primary security strategy)
    if (req.cookies && req.cookies[cookieName]) {
      token = req.cookies[cookieName];
    }
    // Optional fallback: Authorization Bearer header for API testing tools
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No session token was provided.'
      });
    }

    // 2. Verify token signature and expiration
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: 'Server security configuration error: JWT_SECRET missing.'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Your session has expired. Please log in again.'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token. Please log in again.'
      });
    }

    // 3. Verify user still exists in database
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'The user account associated with this session no longer exists.'
      });
    }

    // 4. Verify user has not changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: 'Your password was recently changed. Please log in with your new credentials.'
      });
    }

    // 5. Grant access: attach user to request object
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to restrict endpoints to specific roles (e.g. 'admin')
 * @param  {...string} roles - Permitted roles
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.'
      });
    }
    next();
  };
};
