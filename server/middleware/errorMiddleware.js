/**
 * 404 Not Found Middleware for API routes
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Centralized Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Handle Mongoose CastError (invalid ObjectId format)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with id: ${err.value}`;
  }

  // Handle Mongoose Duplicate Key error (e.g. unique email constraint code 11000)
  if (err.code === 11000) {
    statusCode = 409; // Conflict
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `This ${field} is already registered. Please use another ${field}.`;
  }

  // Handle Mongoose Schema Validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errors = Object.values(err.errors).map(val => val.message);
    message = errors.join(', ');
  }

  // Handle JWT verification errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again.';
  }

  // Avoid leaking internal details in production
  const responsePayload = {
    success: false,
    message,
    ...(errors && { errors })
  };

  if (process.env.NODE_ENV === 'development') {
    responsePayload.stack = err.stack;
  }

  return res.status(statusCode).json(responsePayload);
};
