// Logo Routes - Serve logo images based on theme
const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Generate SVG placeholder logo if file doesn't exist
const generatePlaceholderLogo = (theme) => {
  const bgColor = theme === 'light' ? '#ffffff' : '#1e293b';
  const textColor = theme === 'light' ? '#047857' : '#2dd4bf';
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="64" viewBox="0 0 200 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="64" fill="${bgColor}"/>
  <text x="100" y="40" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
        fill="${textColor}" text-anchor="middle">Directory</text>
</svg>`;
};

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
  
  // Check if file exists
  if (fs.existsSync(logoPath)) {
    // Send logo file
    res.sendFile(logoPath, (err) => {
      if (err) {
        console.error(`[Logo] Error serving logo for theme "${theme}":`, err);
        // Fallback to SVG placeholder
        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(generatePlaceholderLogo(theme));
      }
    });
  } else {
    // File doesn't exist - return SVG placeholder
    console.log(`[Logo] Logo file not found for theme "${theme}", using placeholder`);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(generatePlaceholderLogo(theme));
  }
});

module.exports = router;

