// Profile Routes - Employee profile data endpoints
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Get employee profile with all sections
router.get('/employee/:employeeId', profileController.getEmployeeProfile);

// Get value proposition (generate if not exists)
router.get('/employee/:employeeId/value-proposition', profileController.getValueProposition);

// Get courses from Course Builder (completed courses with feedback)
router.get('/employee/:employeeId/courses/completed', profileController.getCompletedCourses);

// Get courses from Content Studio (courses taught by trainer)
router.get('/trainer/:trainerId/courses/taught', profileController.getTaughtCourses);

// Get assigned courses (from company learning paths - future feature)
router.get('/employee/:employeeId/courses/assigned', profileController.getAssignedCourses);

// Get learning courses (currently in progress)
router.get('/employee/:employeeId/courses/learning', profileController.getLearningCourses);

module.exports = router;

