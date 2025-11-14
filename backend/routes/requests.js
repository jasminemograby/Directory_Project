// Requests Routes - All request types
const express = require('express');
const router = express.Router();
const requestsController = require('../controllers/requestsController');

// Employee request creation endpoints
router.post('/training/:employeeId', requestsController.createTrainingRequest);
router.post('/skill-verification/:employeeId', requestsController.createSkillVerificationRequest);
router.post('/self-learning/:employeeId', requestsController.createSelfLearningRequest);
router.post('/extra-attempt/:employeeId', requestsController.createExtraAttemptRequest);

// Get employee's own requests
router.get('/employee/:employeeId', requestsController.getEmployeeRequests);

// HR endpoints - Get pending requests
router.get('/pending', requestsController.getPendingRequests);

// HR endpoints - Approve/reject requests
router.put('/training/:requestId', requestsController.updateTrainingRequest);
router.put('/skill-verification/:requestId', requestsController.updateSkillVerificationRequest);
router.put('/self-learning/:requestId', requestsController.updateSelfLearningRequest);
router.put('/extra-attempt/:requestId', requestsController.updateExtraAttemptRequest);

module.exports = router;

