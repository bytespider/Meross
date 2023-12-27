import { Buffer } from 'node:buffer';
import { TextEncoder } from 'node:util';
import { createHash, randomUUID, subtle } from 'node:crypto';

import { Header } from "./header.js";

export const prettyJSON = (json) => JSON.stringify(json, undefined, 2);
export const base64 = {
  encode: (str) => Buffer.from(str).toString('base64'),
  decode: (str) => Buffer.from(str, 'base64').toString('utf8')
}

/**
 * Generates an random UUID
 * @returns {string}
 */
export function generateId() {
  return randomUUID();
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
  const hash = createHash('md5').update(`${macAddress}${key}`).digest('hex');
  return `${userId}_${hash}`;
}

/**
 * Clones the supplied object and removes any properties with an undefined value
 * @param {object} obj 
 * @returns {object}
 */
export function filterUndefined(obj) {
  for (const key in obj) {
    if (undefined === obj[key]) {
      delete obj[key]
    }
  }

  return obj
}

export function verboseLogLevel(verbosity) {
  if (verbosity >= 2) {
    return 'debug';
  } else if (verbosity >= 1) {
    return 'warn';
  }

  return 'info';
}
