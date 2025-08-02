import { test } from 'node:test';
import assert from 'node:assert';
import { Header, Method, Namespace } from './header.js';

test('should create a Header instance with valid options', (t) => {
  const options = {
    from: 'device1',
    messageId: '12345',
    timestamp: 1672531200000,
    sign: 'abc123',
    method: Method.GET,
    namespace: Namespace.SYSTEM_ALL,
  };

  const header = new Header(options);

  assert.strictEqual(header.from, options.from);
  assert.strictEqual(header.messageId, options.messageId);
  assert.strictEqual(header.timestamp, options.timestamp);
  assert.strictEqual(header.sign, options.sign);
  assert.strictEqual(header.method, options.method);
  assert.strictEqual(header.namespace, options.namespace);
  assert.strictEqual(header.payloadVersion, 1);
});

test('should use default values for optional fields', (t) => {
  const options = {
    method: Method.SET,
    namespace: Namespace.SYSTEM_TIME,
  };

  const header = new Header(options);

  assert.strictEqual(header.from, '');
  assert.strictEqual(typeof header.messageId, 'string');
  assert.notStrictEqual(header.messageId, '');
  assert.strictEqual(typeof header.timestamp, 'number');
  assert.strictEqual(header.sign, '');
  assert.strictEqual(header.method, options.method);
  assert.strictEqual(header.namespace, options.namespace);
  assert.strictEqual(header.payloadVersion, 1);
});
