// Company Registration Validators
const { body } = require('express-validator');
const validators = require('../utils/validators');

const companyRegistrationStep1Validator = [
  validators.requiredString('companyName', 2, 255),
  body('industry')
    .trim()
    .notEmpty().withMessage('Industry is required')
    .isIn(['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Retail', 'Other'])
    .withMessage('Invalid industry selection'),
  validators.requiredString('hrName', 2, 255),
  body('hrEmail')
    .trim()
    .notEmpty().withMessage('HR email is required')
    .isEmail().withMessage('Invalid email format'),
  validators.requiredString('hrRole', 2, 255),
  validators.domain(),
];

const companyRegistrationStep4Validator = [
  body('employees')
    .isArray({ min: 1 }).withMessage('At least one employee is required')
    .custom((employees) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      for (const emp of employees) {
        if (!emp.name || !emp.email || !emp.currentRole || !emp.targetRole || !emp.type) {
          throw new Error('All employees must have name, email, currentRole, targetRole, and type');
        }
        if (!emailRegex.test(emp.email)) {
          throw new Error(`Invalid email format for employee: ${emp.email}`);
        }
      }
      return true;
    }),
  body('departments')
    .optional({ checkFalsy: true, nullable: true }) // Accept undefined, null, empty string, empty array
    .custom((value) => {
      // If value is undefined, null, or empty string, it's valid (optional)
      if (value === undefined || value === null || value === '') {
        return true;
      }
      // If value is provided, it must be an array
      if (!Array.isArray(value)) {
        throw new Error('Departments must be an array');
      }
      // Empty array is valid (departments are optional)
      return true;
    })
    .customSanitizer((value) => {
      // Always convert to array - handle all cases
      if (value === undefined || value === null || value === '') {
        return [];
      }
      // If it's already an array, return it
      if (Array.isArray(value)) {
        return value;
      }
      // If it's not an array, return empty array
      return [];
    }),
  body('learningPathPolicy')
    .isIn(['manual', 'auto']).withMessage('Learning path policy must be manual or auto'),
  body('decisionMakerId')
    .if(body('learningPathPolicy').equals('manual'))
    .notEmpty().withMessage('Decision Maker is required for manual approval'),
  validators.optionalString('primaryKPI', 1000),
];

module.exports = {
  companyRegistrationStep1Validator,
  companyRegistrationStep4Validator,
};

