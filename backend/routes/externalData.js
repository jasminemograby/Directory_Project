// External Data Collection Routes (LinkedIn, GitHub OAuth)
const express = require('express');
const router = express.Router();
const externalDataController = require('../controllers/externalDataController');

// LinkedIn OAuth routes
router.get('/linkedin/authorize/:employeeId', externalDataController.initiateLinkedInAuth);
router.get('/linkedin/callback', externalDataController.handleLinkedInCallback);
router.get('/linkedin/data/:employeeId', externalDataController.fetchLinkedInData);

// GitHub OAuth routes
router.get('/github/authorize/:employeeId', externalDataController.initiateGitHubAuth);
router.get('/github/callback', externalDataController.handleGitHubCallback);
router.get('/github/data/:employeeId', externalDataController.fetchGitHubData);

// Combined data collection
router.post('/collect/:employeeId', externalDataController.collectAllData);

// Get processed data (bio, projects, skills)
router.get('/processed/:employeeId', externalDataController.getProcessedData);

// Check connection status (without fetching data)
router.get('/status/:employeeId', externalDataController.getConnectionStatus);

// Disconnect provider (delete token)
router.delete('/disconnect/:employeeId/:provider', externalDataController.disconnectProvider);

module.exports = router;

