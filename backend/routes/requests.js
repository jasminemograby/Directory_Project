// Requests Routes - Employee requests endpoints
const express = require('express');
const router = express.Router();
const requestsController = require('../controllers/requestsController');

// Employee request creation endpoints
router.post('/training/:employeeId', requestsController.createTrainingRequest);
router.post('/skill-verification/:employeeId', requestsController.createSkillVerificationRequest);
router.post('/self-learning/:employeeId', requestsController.createSelfLearningRequest);
router.post('/extra-attempts/:employeeId', requestsController.createExtraAttemptRequest);

// Get employee's own requests
router.get('/employee/:employeeId', requestsController.getEmployeeRequests);

// HR endpoints (approval/rejection)
router.get('/pending', requestsController.getPendingRequests);
router.post('/approve/:requestType/:requestId', requestsController.approveRequest);
router.post('/reject/:requestType/:requestId', requestsController.rejectRequest);

module.exports = router;

