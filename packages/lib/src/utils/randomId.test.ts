import { test } from 'node:test';
import assert from 'node:assert';
import { randomId } from './randomId';

test('randomId should generate a string of the correct length', () => {
  const id = randomId();
  assert.strictEqual(id.length, 32); // UUID without dashes has 32 characters
});

test('randomId should generate unique strings', () => {
  const id1 = randomId();
  const id2 = randomId();
  assert.notStrictEqual(id1, id2); // Ensure IDs are unique
});

test('randomId should only contain alphanumeric characters', () => {
  const id = randomId();
  assert.match(id, /^[a-f0-9]{32}$/i); // UUID without dashes is hexadecimal
});
