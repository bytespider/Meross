import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';
import winston from 'winston';

const capitalize = winston.format((info, opts) => {
  const { level = true, message = false } = opts;
  if (level) {
    info.level = info.level.toUpperCase();
  }

  if (message) {
    info.message = info.message.toUpperCase();
  }

  return info;
});

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    capitalize(),
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(
        capitalize(),
        winston.format.colorize(),
        winston.format.errors(),
        winston.format.printf(({ level, message, timestamp, ...args }) => {
          return `${timestamp} ${level}: ${message} ${prettyJSON(args)}`;
        })
      )
    })
  ]
});


export const prettyJSON = (json) => JSON.stringify(json, undefined, 2);

export const base64 = {
  encode: (str) => Buffer.from(str).toString('base64'),
  decode: (str) => Buffer.from(str, 'base64').toString('utf8'),
};

/**
 * Generates a random ID of size
 * @param {number} size 
 * @returns 
 */
export function randomId(size = 16) {
  return crypto.randomBytes(size).toString('hex');
}


/**
 * Generates an random UUID
 * @returns {string}
 */
export function generateId() {
  return randomId();
}

/**
 * Gets the current time in seconds
 * @returns {number}
 */
export function generateTimestamp() {
  return Math.round(Date.now() / 1000);
}

/**
 * Computes the device password from the supplied parameters
 * @param {string} macAddress 
 * @param {string} key 
 * @param {number} userId 
 * @returns {string}
 */
export function computeDevicePassword(macAddress, key = '', userId = 0) {
  const hash = crypto.createHash('md5').update(`${macAddress}${key}`).digest('hex');
  return `${userId}_${hash}`;
}

/**
 * Clones the supplied object and removes any properties with an undefined value
 * @param {object} obj 
 * @returns {object}
 */
export function filterUndefined(obj) {
  const clonedObj = { ...obj };
  for (const key in clonedObj) {
    if (undefined === clonedObj[key]) {
      delete clonedObj[key];
    }
  }

  return clonedObj;
}