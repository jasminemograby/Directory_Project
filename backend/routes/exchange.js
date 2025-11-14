// Exchange Routes - Cross-Microservice Exchange Protocol
const express = require('express');
const router = express.Router();
const { exchange } = require('../controllers/exchangeController');
const rateLimit = require('express-rate-limit');

// Rate limiting: 60 requests per minute per IP
const exchangeRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/exchange - Cross-microservice exchange endpoint
router.post('/', exchangeRateLimit, exchange);

module.exports = router;

