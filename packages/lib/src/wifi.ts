import type { DeviceHardware } from './device.js';
import Encryption from './encryption.js';
import md5 from './utils/md5.js';

export enum WifiCipher {
  NONE,
  WEP,
  TKIP,
  AES,
  TKIPAES,
}

export enum WifiEncryption {
  OPEN,
  SHARE,
  WEPAUTO,
  WPA1,
  WPA1PSK,
  WPA2,
  WPA2PSK,
  WPA1WPA2,
  WPA1PSKWPA2PSK,
}

type EncryptPasswordOptions = {
  password: string;
  hardware: DeviceHardware & {
    type: string;
  };
};

export async function encryptPassword(
  options: EncryptPasswordOptions
): Promise<Buffer> {
  const { password, hardware } = options;
  const { type, uuid, macAddress } = hardware;
  if (!password) {
    throw new Error('Password is required');
  }
  if (!type || !uuid || !macAddress) {
    throw new Error('Hardware information is required');
  }

  const key = Buffer.from(md5(`${type}${uuid}${macAddress}`, 'hex'), 'utf-8');
  const data = Buffer.from(password, 'utf-8');

  return Encryption.encrypt(data, key);
}

export type WifiAccessPointOptions = {
  ssid?: string;
  bssid?: string;
  channel?: number;
  cipher?: WifiCipher;
  encryption?: WifiEncryption;
  password?: string;
  signal?: number;
};

export class WifiAccessPoint {
  ssid;
  bssid;
  channel;
  cipher;
  encryption;
  password;
  signal;

  constructor(options: WifiAccessPointOptions = {}) {
    const { ssid, bssid, channel, cipher, encryption, password, signal } =
      options;

    if (ssid?.length > 32) {
      throw new Error('SSID length exceeds 32 characters');
    }

    if (bssid?.length > 17) {
      throw new Error('BSSID length exceeds 17 characters');
    }

    if (password?.length > 64) {
      throw new Error('Password length exceeds 64 characters');
    }

    this.ssid = ssid;
    this.bssid = bssid;
    this.channel = channel;
    this.cipher = cipher;
    this.encryption = encryption;
    this.password = password;
    this.signal = signal;
  }

  isOpen() {
    return (
      this.encryption == WifiEncryption.OPEN && this.cipher == WifiCipher.NONE
    );
  }

  isWEP() {
    return (
      this.encryption == WifiEncryption.OPEN && this.cipher == WifiCipher.WEP
    );
  }
}
