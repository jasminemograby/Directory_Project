// Auth Routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login (email-based, no password for now)
router.post('/login', authController.login);

// Get current user (verify token)
router.get('/me', authController.getCurrentUser);

// Logout
router.post('/logout', authController.logout);

module.exports = router;

