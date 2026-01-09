const logger = require('../utils/logger');

const errorHandler = (err, req, res, _next) => {
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Log server-side for observability
  logger.error('Unhandled error', { message, status, stack: err.stack });

  const response = {
    success: false,
    message,
  };

  if (err.errors) {
    response.errors = err.errors;
  }

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  res.status(status).json(response);
};

module.exports = errorHandler;
