// 404 Not Found Middleware
const notFound = (req, res, next) => {
  console.log(`[404] Route not found: ${req.method} ${req.path}`);
  console.log(`[404] Original URL: ${req.originalUrl}`);
  console.log(`[404] Base URL: ${req.baseUrl}`);
  console.log(`[404] Route path: ${req.route?.path || 'no route matched'}`);
  
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
};

module.exports = notFound;

