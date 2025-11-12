// Employee Registration Routes
const express = require('express');
const router = express.Router();
const employeeRegistrationController = require('../controllers/employeeRegistrationController');

// Check employee registration status for a company
router.get('/company/:companyId/check', employeeRegistrationController.checkEmployeesRegistration);

// Trigger HR notification about unregistered employees
router.post('/company/:companyId/notify-hr', employeeRegistrationController.triggerHRNotification);

module.exports = router;

