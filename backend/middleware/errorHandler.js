// Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = null;

  // Validation errors
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation Error';
    details = err.errors || err.details;
  }

  // Database connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || 
      err.code === 'ENOTFOUND' || err.code === 'ECONNRESET' ||
      err.message?.includes('Connection terminated') || 
      err.message?.includes('timeout') ||
      err.message?.includes('Connection pool')) {
    status = 503;
    message = 'Database connection error. Please try again.';
    console.error('Database connection error:', {
      code: err.code,
      message: err.message,
      detail: err.detail
    });
  } else if (err.code === '23505') {
    // Unique constraint violation
    status = 409;
    message = 'Duplicate entry';
    // Log more details about the duplicate
    console.error('Duplicate entry error:', err.detail || err.message);
    console.error('Error constraint:', err.constraint);
    console.error('Error table:', err.table);
    // Add more helpful error message
    if (err.constraint === 'employees_email_key') {
      message = `Employee with this email already exists. Please use a different email or clear existing employees.`;
    } else if (err.constraint?.includes('departments')) {
      message = `Department with this name already exists for this company. Please use a different name or clear existing departments.`;
    } else if (err.constraint?.includes('teams')) {
      message = `Team with this name already exists in this department. Please use a different name or clear existing teams.`;
    }
  } else if (err.code === '23503') {
    // Foreign key constraint violation
    status = 400;
    message = 'Invalid reference';
  } else if (err.code === '23502') {
    // Not null constraint violation
    status = 400;
    message = 'Required field missing';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired';
  }

  // Response
  const response = {
    success: false,
    error: message,
    message: message, // Also include as 'message' for consistency
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(details && { details }),
  };

  res.status(status).json(response);
};

module.exports = errorHandler;

