const winston = require('winston');
const { combine, timestamp, json } = winston.format;

// not use create logger, directly configure winson default logger to avoid log prefix:
// [winston] Attempt to write logs with no transports, which can increase memory usage:
winston.configure({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
      timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
      json()
    ),
    transports: [
      new winston.transports.Console()
    ]
});

module.exports = {
    logger: winston
};