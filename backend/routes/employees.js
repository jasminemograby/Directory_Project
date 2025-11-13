// Employee Routes
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

// Get employee by ID
router.get('/:id', employeeController.getEmployee);

// Update employee
router.put('/:id', employeeController.updateEmployee);

// Get all employees (with optional filters)
router.get('/', employeeController.getEmployees);

module.exports = router;

