// ─────────────────────────────────────────
//  src/middleware/errorHandler.js
// ─────────────────────────────────────────
const logger = require('../utils/logger');

const notFound = (req, res, next) => {
  const err = new Error(`Not Found — ${req.originalUrl}`);
  err.status = 404;
  next(err);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;

  logger.error(`${statusCode} — ${err.message}`, {
    method: req.method,
    path: req.path,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });

  res.status(statusCode).json({
    error: {
      message: statusCode === 500 && process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message,
      status: statusCode,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    }
  });
};

module.exports = { notFound, errorHandler };
