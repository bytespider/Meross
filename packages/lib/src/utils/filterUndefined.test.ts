import { test } from 'node:test';
import assert from 'node:assert';
import { filterUndefined } from './filterUndefined';

test('filterUndefined should remove keys with undefined values', () => {
  const input = { a: 1, b: undefined, c: 'test', d: undefined };
  const expected = { a: 1, c: 'test' };

  const result = filterUndefined(input);

  assert.deepEqual(result, expected);
});

test('filterUndefined should return an empty object if all values are undefined', () => {
  const input = { a: undefined, b: undefined };
  const expected = {};

  const result = filterUndefined(input);

  assert.deepEqual(result, expected);
});

test('filterUndefined should return the same object if no values are undefined', () => {
  const input = { a: 1, b: 'test', c: true };
  const expected = { a: 1, b: 'test', c: true };

  const result = filterUndefined(input);

  assert.deepEqual(result, expected);
});

test('filterUndefined should handle an empty object', () => {
  const input = {};
  const expected = {};

  const result = filterUndefined(input);

  assert.deepEqual(result, expected);
});

test('filterUndefined should not remove keys with null or falsy values other than undefined', () => {
  const input = { a: null, b: 0, c: false, d: '', e: undefined };
  const expected = { a: null, b: 0, c: false, d: '' };

  const result = filterUndefined(input);

  assert.deepEqual(result, expected);
});
