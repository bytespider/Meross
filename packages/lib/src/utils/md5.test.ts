import { test } from 'node:test';
import assert from 'node:assert';
import { md5 } from './md5';

test('md5 should correctly hash a Buffer to an MD5 hash string', () => {
  const hash = md5('Hello, World!', 'hex');

  assert.strictEqual(hash, '65a8e27d8879283831b664bd8b7f0ad4');
});

test('md5 should produce consistent hashes for the same input', () => {
  const hash1 = md5('Consistent Hash Test', 'hex');
  const hash2 = md5('Consistent Hash Test', 'hex');

  assert.strictEqual(hash1, hash2);
});

test('md5 should produce different hashes for different inputs', () => {
  const hash1 = md5('Input One', 'hex');
  const hash2 = md5('Input Two', 'hex');

  assert.notStrictEqual(hash1, hash2);
});

test('md5 should correctly hash a Buffer input', () => {
  const bufferInput = Buffer.from('Buffer Input Test', 'utf-8');
  const hash = md5(bufferInput, 'hex');

  assert.strictEqual(hash, '25d7f032e75c374d64ae492a861306ad');
});

test('md5 should return a Buffer when no encoding is provided', () => {
  const result = md5('No Encoding Test');

  assert.ok(Buffer.isBuffer(result));
  assert.strictEqual(
    result.toString('hex'),
    '6e946a024f48e761768914ef6437d1eb'
  );
});

test('md5 should handle empty string input', () => {
  const hash = md5('', 'hex');

  assert.strictEqual(hash, 'd41d8cd98f00b204e9800998ecf8427e'); // MD5 hash of an empty string
});

test('md5 should handle empty Buffer input', () => {
  const hash = md5(Buffer.alloc(0), 'hex');

  assert.strictEqual(hash, 'd41d8cd98f00b204e9800998ecf8427e'); // MD5 hash of an empty buffer
});

test('md5 should throw an error for invalid input types', () => {
  assert.throws(() => {
    md5(123 as unknown as string);
  }, /The "data" argument must be of type string or an instance of Buffer/);
});
