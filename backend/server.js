const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();

// CORS configuration - support multiple origins
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

// Log CORS configuration (development only)
if (process.env.NODE_ENV === 'development') {
  console.log('CORS Configuration:');
  console.log('  CORS_ORIGIN env:', process.env.CORS_ORIGIN || 'not set');
  console.log('  Allowed origins:', allowedOrigins);
}

// CORS middleware - MUST be before helmet and other middleware
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (process.env.NODE_ENV === 'development') {
      // In development, allow all origins
      callback(null, true);
    } else {
      // Check if origin is a Vercel preview URL (for preview deployments)
      const isVercelPreview = origin.includes('vercel.app') || origin.includes('vercel.com');
      
      if (isVercelPreview) {
        // Allow all Vercel preview URLs
        console.log(`[CORS] Allowing Vercel preview URL: ${origin}`);
        callback(null, true);
      } else {
        // Log the rejected origin
        console.error('[CORS] Blocked origin:', origin);
        console.error('[CORS] Allowed origins:', allowedOrigins);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (also at root for Railway)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'directory-backend',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'directory-backend',
    version: '1.0.0'
  });
});

// Routes
app.use('/api/company', require('./routes/companyRegistration'));
app.use('/api/employee-registration', require('./routes/employeeRegistration'));
app.use('/api/employee', require('./routes/employees'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/external', require('./routes/externalData'));
app.use('/api/profile', require('./routes/profile'));

// 404 handler (must be after all routes)
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Listen on all interfaces (0.0.0.0) for Railway
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Directory Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

module.exports = app;
