import { test } from 'node:test';
import assert from 'node:assert';
import { computeDevicePassword } from './computeDevicePassword';

test('computeDevicePassword should generate a consistent password for the same inputs', () => {
  const macAddress = '00:1A:2B:3C:4D:5E';
  const key = 'secretKey';
  const userId = 123;

  const password1 = computeDevicePassword(macAddress, key, userId);
  const password2 = computeDevicePassword(macAddress, key, userId);

  assert.strictEqual(password1, password2);
});

test('computeDevicePassword should generate different passwords for different MAC addresses', () => {
  const macAddress1 = '00:1A:2B:3C:4D:5E';
  const macAddress2 = '11:22:33:44:55:66';
  const key = 'secretKey';
  const userId = 123;

  const password1 = computeDevicePassword(macAddress1, key, userId);
  const password2 = computeDevicePassword(macAddress2, key, userId);

  assert.notStrictEqual(password1, password2);
});

test('computeDevicePassword should generate different passwords for different keys', () => {
  const macAddress = '00:1A:2B:3C:4D:5E';
  const key1 = 'secretKey1';
  const key2 = 'secretKey2';
  const userId = 123;

  const password1 = computeDevicePassword(macAddress, key1, userId);
  const password2 = computeDevicePassword(macAddress, key2, userId);

  assert.notStrictEqual(password1, password2);
});

test('computeDevicePassword should generate different passwords for different userIds', () => {
  const macAddress = '00:1A:2B:3C:4D:5E';
  const key = 'secretKey';
  const userId1 = 123;
  const userId2 = 456;

  const password1 = computeDevicePassword(macAddress, key, userId1);
  const password2 = computeDevicePassword(macAddress, key, userId2);

  assert.notStrictEqual(password1, password2);
});

test('computeDevicePassword should handle default values for key and userId', () => {
  const macAddress = '00:1A:2B:3C:4D:5E';

  const password = computeDevicePassword(macAddress);

  assert.ok(password);
  assert.match(password, /^0_[a-f0-9]{32}$/); // Default userId is 0, and MD5 hash is 32 hex characters
});
