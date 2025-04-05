import winston from 'winston';

const { combine, timestamp, printf, metadata } = winston.format;

const capitalizeLevel = winston.format((info) => {
  info.level = info.level.toUpperCase();
  return info;
})();

const customFormat = printf((info) =>
  `${info.timestamp} ${info.level}: ${info.message} ${JSON.stringify(
    info.metadata
  )}`.trim()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  silent: !process.env.LOG_LEVEL,
  format: combine(
    capitalizeLevel,
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    customFormat,
    metadata({ fillExcept: ['message', 'level', 'timestamp'] })
  ),
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      format: combine(winston.format.colorize(), customFormat),
    }),
    new winston.transports.File({
      level: 'debug',
      filename: 'debug.log',
      format: combine(winston.format.json()),
    }),
  ],
});

export default logger;
