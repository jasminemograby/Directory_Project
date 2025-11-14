// Admin Routes - Super Admin endpoints
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Get all companies (Super Admin only)
router.get('/companies', adminController.getAllCompanies);

// Get all employees (Super Admin only - read-only)
router.get('/employees', adminController.getAllEmployees);

// Get admin logs
router.get('/logs', adminController.getAdminLogs);

module.exports = router;

