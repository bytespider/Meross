import { test } from 'node:test';
import assert from 'node:assert';
import { calculatePaddingForBlockSize, pad, trimPadding } from './buffer.js';

test('calculatePaddingForBlockSize should calculate correct padding', () => {
  const data = Buffer.from('12345');
  const blockSize = 8;
  const padding = calculatePaddingForBlockSize(data, blockSize);
  assert.strictEqual(padding, 3);
});

test('calculatePaddingForBlockSize should return blockSize when data length is a multiple of blockSize', () => {
  const data = Buffer.from('12345678');
  const blockSize = 8;
  const padding = calculatePaddingForBlockSize(data, blockSize);
  assert.strictEqual(padding, 8);
});

test('pad should append the correct padding to the buffer', () => {
  const data = Buffer.from('12345');
  const padded = pad(data, 3, 0);
  assert.strictEqual(padded.toString(), '12345\0\0\0');
});

test('pad should handle custom fill values', () => {
  const data = Buffer.from('12345');
  const padded = pad(data, 3, 65); // ASCII for 'A'
  assert.strictEqual(padded.toString(), '12345AAA');
});

test('trimPadding should remove the correct padding from the buffer', () => {
  const data = Buffer.from('12345\0\0\0');
  const trimmed = trimPadding(data, 0);
  assert.strictEqual(trimmed.toString(), '12345');
});

test('trimPadding should handle buffers with no padding', () => {
  const data = Buffer.from('12345');
  const trimmed = trimPadding(data, 0);
  assert.strictEqual(trimmed.toString(), '12345');
});

test('trimPadding should handle empty buffers', () => {
  const data = Buffer.from('');
  const trimmed = trimPadding(data, 0);
  assert.strictEqual(trimmed.toString(), '');
});

test('trimPadding should handle custom fill values', () => {
  const data = Buffer.from('12345AAA');
  const trimmed = trimPadding(data, 65); // ASCII for 'A'
  assert.strictEqual(trimmed.toString(), '12345');
});
