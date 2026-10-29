import crypto from 'crypto';

const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a cryptographically secure CSRF token
 */
export const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Endpoint handler to issue a new CSRF token
 */
export const getCsrfTokenHandler = (req, res) => {
  const token = generateCsrfToken();
  const isProduction = process.env.NODE_ENV === 'production';

  // Set as non-httpOnly cookie so frontend JavaScript can read it if needed,
  // or use the JSON response directly.
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/'
  });

  return res.json({
    success: true,
    csrfToken: token
  });
};

/**
 * Middleware to verify CSRF token on state-changing requests
 */
export const csrfProtection = (req, res, next) => {
  // Safe HTTP methods do not change state
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Bypass in test environment if configured
  if (process.env.NODE_ENV === 'test' && !req.headers[CSRF_HEADER_NAME]) {
    return next();
  }

  const clientToken = req.headers[CSRF_HEADER_NAME];
  const cookieToken = req.cookies ? req.cookies[CSRF_COOKIE_NAME] : null;

  // Verify that the token supplied in the header matches the double-submit cookie
  if (!clientToken || !cookieToken || clientToken !== cookieToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token validation failed. Request rejected.'
    });
  }

  next();
};
