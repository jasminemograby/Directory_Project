// Profile Approval Routes - HR approval endpoints
const express = require('express');
const router = express.Router();
const profileApprovalController = require('../controllers/profileApprovalController');

// Get pending profiles for HR approval
router.get('/pending', profileApprovalController.getPendingProfiles);

// Get profile details for approval review
router.get('/:employeeId/review', profileApprovalController.getProfileForApproval);

// Approve profile
router.post('/:employeeId/approve', profileApprovalController.approveProfile);

// Reject profile
router.post('/:employeeId/reject', profileApprovalController.rejectProfile);

module.exports = router;

