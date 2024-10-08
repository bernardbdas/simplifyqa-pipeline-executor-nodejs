import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import winston from 'winston';
import winstonDaily from 'winston-daily-rotate-file';

// import { fileURLToPath } from 'url';
// import { LOG_DIR } from "@config";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// logs dir
const logDir: string = join(__dirname, '../logs');

if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

// Define log format
const logFormat = winston.format.printf(
  ({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`
);

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'DD-MMM-YYYY HH:mm:ss'
    }),
    logFormat
  ),
  transports: [
    // debug log setting
    new winstonDaily({
      level: 'debug',
      datePattern: 'DD-MMM-YYYY',
      dirname: logDir + '/debug', // log file /logs/debug/*.log in save
      filename: `%DATE%.log`,
      maxFiles: 30, // 30 Days saved
      json: false,
      zippedArchive: true
    }),
    // error log setting
    new winstonDaily({
      level: 'error',
      datePattern: 'DD-MMM-YYYY',
      dirname: logDir + '/error', // log file /logs/error/*.log in save
      filename: `%DATE%.log`,
      maxFiles: 30, // 30 Days saved
      handleExceptions: true,
      json: false,
      zippedArchive: true
    })
  ]
});

logger.add(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.splat(),
      winston.format.colorize()
    )
  })
);

const stream = {
  write: (message: string) => {
    logger.info(message.substring(0, message.lastIndexOf('\n')));
  }
};

export { logger, stream };
