// Enrollment Routes
const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { authenticate } = require('../middleware/auth');

// Enroll employees to learning paths (HR only)
router.post('/learning-path', authenticate, enrollmentController.enrollEmployeesToLearningPath);

module.exports = router;

