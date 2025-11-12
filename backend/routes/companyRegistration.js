// Company Registration Routes
const express = require('express');
const router = express.Router();
const companyRegistrationController = require('../controllers/companyRegistrationController');
const {
  companyRegistrationStep1Validator,
  companyRegistrationStep4Validator,
} = require('../validators/companyRegistrationValidator');
const validateRequest = require('../middleware/validateRequest');

// Step 1: Basic Registration
router.post(
  '/register',
  companyRegistrationStep1Validator,
  validateRequest,
  companyRegistrationController.registerCompanyStep1
);

// Step 4: Full Setup
router.post(
  '/register/step4',
  companyRegistrationStep4Validator,
  validateRequest,
  companyRegistrationController.registerCompanyStep4
);

// Check Verification Status
router.post(
  '/:id/verify',
  companyRegistrationController.checkVerificationStatus
);

module.exports = router;

