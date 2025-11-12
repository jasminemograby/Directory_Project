// Validation Utilities
const { body } = require('express-validator');

const validators = {
  // Email validation
  email: () => body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  
  // Domain validation
  domain: () => body('domain')
    .trim()
    .notEmpty().withMessage('Domain is required')
    .matches(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i)
    .withMessage('Invalid domain format'),
  
  // URL validation
  url: (field = 'url') => body(field)
    .optional()
    .trim()
    .isURL().withMessage('Invalid URL format'),
  
  // Required string
  requiredString: (field, minLength = 1, maxLength = 255) => body(field)
    .trim()
    .notEmpty().withMessage(`${field} is required`)
    .isLength({ min: minLength, max: maxLength })
    .withMessage(`${field} must be between ${minLength} and ${maxLength} characters`),
  
  // Optional string
  optionalString: (field, maxLength = 255) => body(field)
    .optional()
    .trim()
    .isLength({ max: maxLength })
    .withMessage(`${field} must be less than ${maxLength} characters`),
  
  // UUID validation
  uuid: (field = 'id') => body(field)
    .isUUID().withMessage('Invalid UUID format'),
  
  // Enum validation
  enum: (field, values, fieldName = field) => body(field)
    .isIn(values).withMessage(`${fieldName} must be one of: ${values.join(', ')}`),
  
  // Positive integer
  positiveInteger: (field) => body(field)
    .optional()
    .isInt({ min: 1 }).withMessage(`${field} must be a positive integer`),
};

module.exports = validators;

