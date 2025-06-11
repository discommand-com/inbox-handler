import 'dotenv/config';
import winston from 'winston';

/**
 * Factory to create a Winston logger instance.
 * @param {Object} [options]
 * @param {string} [options.level] - Log level (default: process.env.LOG_LEVEL or 'info')
 * @param {Array} [options.transports] - Array of Winston transports (default: Console)
 * @returns {winston.Logger}
 */
export const createLogger = ({
  level = process.env.LOG_LEVEL || 'info',
  transports = [new winston.transports.Console()]
} = {}) =>
  winston.createLogger({
    level,
    format: winston.format.printf(({ level, message, ...meta }) => {
      let msg = `[${level.toUpperCase()}] ${message}`;
      const metaKeys = Object.keys(meta).filter(k => k !== 'level' && k !== 'message');
      if (metaKeys.length > 0) {
        msg += ' ' + JSON.stringify(Object.fromEntries(metaKeys.map(k => [k, meta[k]])));
      }
      return msg;
    }),
    transports
  });

const log = createLogger();
export default log;
