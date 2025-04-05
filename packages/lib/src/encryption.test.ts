import { test } from 'node:test';
import assert from 'node:assert';
import { randomBytes } from 'node:crypto';
import Encryption from './encryption.js';

test('encrypt should return a buffer of encrypted data', async () => {
  const data = Buffer.from('Hello, World!', 'utf-8');
  const encryptionKey = randomBytes(32); // AES-256 requires a 32-byte key

  const encryptedData = await Encryption.encrypt(data, encryptionKey);

  assert.ok(encryptedData);
  assert.notStrictEqual(
    encryptedData.toString('utf-8'),
    data.toString('utf-8')
  );
});

test('encrypt should use the provided IV', async () => {
  const data = Buffer.from('Hello, World!', 'utf-8');
  const encryptionKey = randomBytes(32);
  const customIV = randomBytes(16); // AES-CBC requires a 16-byte IV

  const encryptedData = await Encryption.encrypt(data, encryptionKey, customIV);

  assert.ok(encryptedData);
  assert.notStrictEqual(
    encryptedData.toString('utf-8'),
    data.toString('utf-8')
  );
});

test('encrypt should use the default IV if none is provided', async () => {
  const data = Buffer.from('Hello, World!', 'utf-8');
  const encryptionKey = randomBytes(32);

  const encryptedData = await Encryption.encrypt(data, encryptionKey);

  assert.ok(encryptedData);
  assert.notStrictEqual(
    encryptedData.toString('utf-8'),
    data.toString('utf-8')
  );
});

test('encrypt should throw an error if the encryption key is invalid', async () => {
  const data = Buffer.from('Hello, World!', 'utf-8');
  const invalidKey = randomBytes(16); // Invalid key length for AES-256

  await assert.rejects(
    async () => {
      await Encryption.encrypt(data, invalidKey);
    },
    { name: 'RangeError', message: /Invalid key length/ }
  );
});
