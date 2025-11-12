// Request Validation Middleware
const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Log validation errors only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Validation errors:', errors.array());
    }
    
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Validation Error',
      details: errors.array(),
    });
  }
  
  next();
};

module.exports = validateRequest;

