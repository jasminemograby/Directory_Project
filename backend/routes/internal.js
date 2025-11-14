// Internal API Routes - Inbound endpoints for other microservices
const express = require('express');
const router = express.Router();
const {
  verifyInternalAuth,
  updateSkillsEngine,
  updateContentStudio,
  updateCourseBuilderFeedback
} = require('../controllers/internalApiController');

// All internal routes require authentication
router.use(verifyInternalAuth);

// POST /api/internal/skills-engine/update
router.post('/skills-engine/update', updateSkillsEngine);

// POST /api/internal/content-studio/update
router.post('/content-studio/update', updateContentStudio);

// POST /api/internal/course-builder/feedback
router.post('/course-builder/feedback', updateCourseBuilderFeedback);

module.exports = router;

