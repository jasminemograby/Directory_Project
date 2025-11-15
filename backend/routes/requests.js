// Requests Routes - All request types
const express = require('express');
const router = express.Router();
const requestsController = require('../controllers/requestsController');
const { verifySameCompany } = require('../middleware/companyIsolation');

// Employee request creation endpoints (with company isolation)
router.post('/training/:employeeId', verifySameCompany, requestsController.createTrainingRequest);
router.post('/skill-verification/:employeeId', verifySameCompany, requestsController.createSkillVerificationRequest);
router.post('/self-learning/:employeeId', verifySameCompany, requestsController.createSelfLearningRequest);
router.post('/extra-attempt/:employeeId', verifySameCompany, requestsController.createExtraAttemptRequest);

// Get employee's own requests (with company isolation)
router.get('/employee/:employeeId', verifySameCompany, requestsController.getEmployeeRequests);

// HR endpoints - Get pending requests
router.get('/pending', requestsController.getPendingRequests);
router.get('/pending/decision-maker/:employeeId', requestsController.getPendingRequestsForDecisionMaker);

// HR endpoints - Approve/reject requests
router.put('/training/:requestId', requestsController.updateTrainingRequest);
router.put('/skill-verification/:requestId', requestsController.updateSkillVerificationRequest);
router.put('/self-learning/:requestId', requestsController.updateSelfLearningRequest);
router.put('/extra-attempt/:requestId', requestsController.updateExtraAttemptRequest);

module.exports = router;

