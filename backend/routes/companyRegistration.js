// Company Registration Routes
const express = require('express');
const router = express.Router();
const companyRegistrationController = require('../controllers/companyRegistrationController');
const companyController = require('../controllers/companyController');
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

// Check HR email availability (for live validation)
router.get('/check-email', companyController.checkHrEmailAvailability);

// Get company by HR email (must be before /:id to avoid route conflict)
router.get('/', (req, res, next) => {
  console.log(`[ROUTE] GET /api/company/ - Route matched for HR email lookup`);
  console.log(`[ROUTE] Query params:`, req.query);
  next();
}, companyController.getCompanyByHrEmail);

// Get company by ID (must be before /:id/verify to avoid route conflict)
router.get('/:id', (req, res, next) => {
  console.log(`[ROUTE] GET /api/company/:id - Route matched`);
  console.log(`[ROUTE] Params:`, req.params);
  console.log(`[ROUTE] Company ID from params: ${req.params.id}`);
  next();
}, companyController.getCompany);

// Check Verification Status
router.post(
  '/:id/verify',
  companyRegistrationController.checkVerificationStatus
);

// Company profile routes
const companyProfileController = require('../controllers/companyProfileController');

router.get('/:companyId/hierarchy', companyProfileController.getCompanyHierarchy);
router.get('/:companyId/requests', companyProfileController.getCompanyRequests);

module.exports = router;

