const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const isProduction = process.env.NODE_ENV === 'production';
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    error: isProduction ? 'Internal server error' : err.message,
    ...(isProduction ? {} : { stack: err.stack })
  });
};

module.exports = errorHandler;
