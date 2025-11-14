// Employee Routes
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticate } = require('../middleware/auth');

// Get employee by ID
router.get('/:id', employeeController.getEmployee);

// Update employee (requires authentication)
router.put('/:id', authenticate, employeeController.updateEmployee);

// Get all employees (with optional filters)
router.get('/', employeeController.getEmployees);

module.exports = router;

