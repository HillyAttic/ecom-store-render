export default function errorHandler(err, req, res, next) {
  console.error(err.stack);
  
  // Default error response
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error'
  });
} 