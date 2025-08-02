import { test } from 'node:test';
import assert from 'node:assert';
import {
  WifiAccessPoint,
  WifiCipher,
  WifiEncryption,
  encryptPassword,
} from './wifi.js';
import { MacAddress, UUID } from './device.js';

test('WifiAccessPoint should throw an error for invalid SSID length', () => {
  assert.throws(() => {
    new WifiAccessPoint({ ssid: 'a'.repeat(33) });
  }, /SSID length exceeds 32 characters/);
});

test('WifiAccessPoint should throw an error for invalid BSSID length', () => {
  assert.throws(() => {
    new WifiAccessPoint({ bssid: 'a'.repeat(18) });
  }, /BSSID length exceeds 17 characters/);
});

test('WifiAccessPoint should throw an error for invalid password length', () => {
  assert.throws(() => {
    new WifiAccessPoint({ password: 'a'.repeat(65) });
  }, /Password length exceeds 64 characters/);
});

test('WifiAccessPoint isOpen should return true for open networks', () => {
  const accessPoint = new WifiAccessPoint({
    encryption: WifiEncryption.OPEN,
    cipher: WifiCipher.NONE,
  });

  assert.strictEqual(accessPoint.isOpen(), true);
});

test('WifiAccessPoint isOpen should return false for non-open networks', () => {
  const accessPoint = new WifiAccessPoint({
    encryption: WifiEncryption.WPA2,
    cipher: WifiCipher.AES,
  });

  assert.strictEqual(accessPoint.isOpen(), false);
});

test('WifiAccessPoint isWEP should return true for WEP networks', () => {
  const accessPoint = new WifiAccessPoint({
    encryption: WifiEncryption.OPEN,
    cipher: WifiCipher.WEP,
  });

  assert.strictEqual(accessPoint.isWEP(), true);
});

test('WifiAccessPoint isWEP should return false for non-WEP networks', () => {
  const accessPoint = new WifiAccessPoint({
    encryption: WifiEncryption.WPA2,
    cipher: WifiCipher.AES,
  });

  assert.strictEqual(accessPoint.isWEP(), false);
});

test('encryptPassword should throw an error if password is missing', async () => {
  await assert.rejects(async () => {
    await encryptPassword({
      password: '',
      hardware: {
        type: 'router',
        uuid: '1234',
        macAddress: '00:11:22:33:44:55',
      },
    });
  }, /Password is required/);
});

test('encryptPassword should throw an error if hardware information is missing', async () => {
  await assert.rejects(async () => {
    await encryptPassword({
      password: 'password123',
      hardware: { type: '', uuid: '' as UUID, macAddress: '' as MacAddress },
    });
  }, /Hardware information is required/);
});

test('encryptPassword should return encrypted data', async () => {
  const encryptedData = await encryptPassword({
    password: 'password123',
    hardware: {
      type: 'router',
      uuid: '1234' as UUID,
      macAddress: '00:11:22:33:44:55' as MacAddress,
    },
  });

  assert.ok(encryptedData instanceof Buffer);
  assert.notStrictEqual(encryptedData.toString('utf-8'), 'password123');
});
