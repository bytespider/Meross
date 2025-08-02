import { test } from 'node:test';
import assert from 'node:assert';

import { encode, decode } from './base64.js';

test('encode should convert a Buffer to a base64 string', () => {
  const buffer = Buffer.from('hello world');
  const result = encode(buffer);
  assert.strictEqual(result, 'aGVsbG8gd29ybGQ=');
});

test('decode should convert a base64 string to a Buffer', () => {
  const base64String = 'aGVsbG8gd29ybGQ=';
  const result = decode(base64String);
  assert.strictEqual(result.toString(), 'hello world');
});

test('encode and decode should be inverses of each other', () => {
  const originalBuffer = Buffer.from('test data');
  const encoded = encode(originalBuffer);
  const decoded = decode(encoded);
  assert.deepStrictEqual(decoded, originalBuffer);
});
