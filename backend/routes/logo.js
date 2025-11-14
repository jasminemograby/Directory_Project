// Logo Routes - Serve logo images based on theme
const express = require('express');
const path = require('path');
const router = express.Router();

// Serve logo images
// GET /api/logo/:theme (light or dark)
router.get('/:theme', (req, res) => {
  const { theme } = req.params;
  
  // Validate theme
  if (theme !== 'light' && theme !== 'dark') {
    return res.status(400).json({
      success: false,
      error: 'Invalid theme. Use "light" or "dark"'
    });
  }

  // Logo file paths
  const logoPath = path.join(__dirname, '../public/logos', `logo-${theme}.png`);
  
  // Send logo file
  res.sendFile(logoPath, (err) => {
    if (err) {
      console.error(`[Logo] Error serving logo for theme "${theme}":`, err);
      // Return 404 if logo not found
      if (err.code === 'ENOENT') {
        res.status(404).json({
          success: false,
          error: `Logo for theme "${theme}" not found`
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error serving logo'
        });
      }
    }
  });
});

module.exports = router;

