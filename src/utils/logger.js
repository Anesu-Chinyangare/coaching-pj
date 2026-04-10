const { createLogger, format, transports } = require('winston');

const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    }),
    // Only write to files locally, not on Vercel
    ...(isVercel ? [] : [
      new transports.File({ filename: 'logs/error.log', level: 'error' }),
      new transports.File({ filename: 'logs/combined.log' }),
    ])
  ]
});

module.exports = logger;
