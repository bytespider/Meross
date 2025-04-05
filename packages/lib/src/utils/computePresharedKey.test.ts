import { test } from 'node:test';
import assert from 'node:assert';
import computePresharedPrivateKey from './computePresharedPrivateKey.js';
import { MacAddress, UUID } from '../device.js';

test('computePresharedPrivateKey should return a valid base64 encoded string', () => {
  const uuid: UUID = '123e4567-e89b-12d3-a456-426614174000';
  const key = 'sharedsecretkey1234567890';
  const macAddress: MacAddress = '00:11:22:33:44:55';

  const result = computePresharedPrivateKey(uuid, key, macAddress);

  assert.strictEqual(typeof result, 'string');
  assert.doesNotThrow(() => Buffer.from(result, 'base64'));
});

test('computePresharedPrivateKey should produce consistent output for the same inputs', () => {
  const uuid: UUID = '123e4567e89b12d3a456426614174000';
  const key = 'sharedsecretkey1234567890';
  const macAddress: MacAddress = '00:11:22:33:44:55';

  const result1 = computePresharedPrivateKey(uuid, key, macAddress);
  const result2 = computePresharedPrivateKey(uuid, key, macAddress);

  assert.strictEqual(result1, result2);
});

test('computePresharedPrivateKey should produce different outputs for different UUIDs', () => {
  const key = 'sharedsecretkey1234567890';
  const macAddress: MacAddress = '00:11:22:33:44:55';

  const result1 = computePresharedPrivateKey(
    '123e4567e89b12d3a456426614174000' as UUID,
    key,
    macAddress
  );
  const result2 = computePresharedPrivateKey(
    '8ebdc941ae7b4bd99662b838af884822' as UUID,
    key,
    macAddress
  );

  assert.notStrictEqual(result1, result2);
});

test('computePresharedPrivateKey should produce different outputs for different keys', () => {
  const uuid: UUID = '123e4567e89b12d3a456426614174000';
  const macAddress: MacAddress = '00:11:22:33:44:55';

  const result1 = computePresharedPrivateKey(uuid, 'key1', macAddress);
  const result2 = computePresharedPrivateKey(uuid, 'key2', macAddress);

  assert.notStrictEqual(result1, result2);
});

test('computePresharedPrivateKey should produce different outputs for different MAC addresses', () => {
  const uuid: UUID = '123e4567e89b12d3a456426614174000';
  const key = 'sharedsecretkey1234567890';

  const result1 = computePresharedPrivateKey(
    uuid,
    key,
    '00:11:22:33:44:55' as MacAddress
  );
  const result2 = computePresharedPrivateKey(
    uuid,
    key,
    '66:77:88:99:AA:BB' as MacAddress
  );

  assert.notStrictEqual(result1, result2);
});
