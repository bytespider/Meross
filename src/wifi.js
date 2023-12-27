import { createCipheriv, createHash } from 'crypto';

/**
 * @readonly
 * @enum {string}
 */
export const WifiCipher = {
  NONE: 'NONE',
  WEP: 'WEP',
  TKIP: 'TKIP',
  AES: 'AES',
  TIKPAES: 'TIKPAES',
  0: 'NONE',
  1: 'WEP',
  2: 'TKIP',
  3: 'AES',
  4: 'TIKPAES',
};

/**
 * @readonly
 * @enum {string}
 */
export const WifiEncryption = {
  0: 'OPEN',
  1: 'SHARE',
  2: 'WEPAUTO',
  3: 'WPA1',
  4: 'WPA1PSK',
  5: 'WPA2',
  6: 'WPA2PSK',
  7: 'WPA1WPA2',
  8: 'WPA1PSKWPA2PS',
  OPEN: 'OPEN',
  SHARE: 'SHARE',
  WEPAUTO: 'WEPAUTO',
  WPA1: 'WPA1',
  WPA1PSK: 'WPA1PSK',
  WPA2: 'WPA2',
  WPA2PSK: 'WPA2PSK',
  WPA1WPA2: 'WPA1WPA2',
  WPA1PSKWPA2PS: 'WPA1PSKWPA2PSK',
};

/**
 * 
 * @param {object} [opts]
 * @param {string} opts.password
 * @param {object} opts.hardware
 * @param {string} opts.hardware.type
 * @param {string} opts.hardware.uuid
 * @param {string} opts.hardware.macAddress
 * @returns {string}
 */
export function encryptPassword({
  password,
  hardware: { type, uuid, macAddress },
} = {}) {
  const key = createHash('md5')
    .update(`${type}${uuid}${macAddress}`)
    .digest('hex');
  const cipher = createCipheriv('aes-256-cbc', key, '0000000000000000');

  // Ensure the password length is a multiple of 16 by padding with null characters.
  const paddingLength = 16;
  const count = Math.ceil(password.length / paddingLength) * paddingLength;
  const paddedPassword = password.padEnd(count, '\0');

  return cipher.update(paddedPassword, 'utf8') + cipher.final('utf8');
}

export class WifiAccessPoint {
  ssid;
  bssid;
  channel;
  cipher;
  encryption;
  password;
  signal;

  /**
   * 
   * @param {object} [opts] 
   * @param {string} [opts.ssid]
   * @param {string} [opts.bssid]
   * @param {number} [opts.channel]
   * @param {WifiCipher} [opts.cipher]
   * @param {WifiEncryption} [opts.encryption]
   * @param {string} [opts.password]
   * @param {number} [opts.signal]
   */
  constructor({
    ssid,
    bssid,
    channel,
    cipher,
    encryption,
    password,
    signal,
  } = {}) {
    this.ssid = ssid;
    this.bssid = bssid;
    this.channel = channel;
    this.cipher = cipher;
    this.encryption = encryption;
    this.password = password;
    this.signal = signal;
  }

  /**
   * 
   * @returns boolean
   */
  isOpen() {
    return this.encryption == Encryption.OPEN && this.cipher == Cipher.NONE;
  }

  /**
   * 
   * @returns boolean
   */
  isWEP() {
    return this.encryption == Encryption.OPEN && this.cipher == Cipher.WEP;
  }
}
