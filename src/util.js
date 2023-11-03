import { Buffer } from 'node:buffer';
import { createHash, randomUUID } from 'node:crypto';

export const prettyJSON = (json) => JSON.stringify(json, undefined, 2);
export const base64 = {
  encode: (str) => Buffer.from(str).toString('base64'),
  decode: (str) => Buffer.from(str, 'base64').toString('utf8'),
};

export function generateId() {
  return randomUUID();
}

export function generateTimestamp() {
  return Math.round(Date.now() / 1000);
}

export function computeDevicePassword(macAddress, key = '', userId = 0) {
  const hash = createHash('md5').update(`${macAddress}${key}`).digest('hex');
  return `${userId}_${hash}`;
}

export function filterUndefined(obj) {
  for (const key in obj) {
    if (undefined === obj[key]) {
      delete obj[key];
    }
  }

  return obj;
}

export function verboseLogLevel(verbosity) {
  if (verbosity >= 2) {
    return 'debug';
  } else if (verbosity >= 1) {
    return 'warn';
  }

  return 'info';
}
