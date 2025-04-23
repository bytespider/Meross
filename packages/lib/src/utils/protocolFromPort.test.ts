import { test } from 'node:test';
import assert from 'node:assert';
import { protocolFromPort } from './protocolFromPort';

test('protocolFromPort should return "http" for port 80', () => {
  assert.strictEqual(protocolFromPort(80), 'http');
});

test('protocolFromPort should return "https" for port 443', () => {
  assert.strictEqual(protocolFromPort(443), 'https');
});

test('protocolFromPort should return "mqtts" for port 8883', () => {
  assert.strictEqual(protocolFromPort(8883), 'mqtts');
});

test('protocolFromPort should return "mqtt" for port 1883', () => {
  assert.strictEqual(protocolFromPort(1883), 'mqtt');
});

test('protocolFromPort should throw an error for unknown ports', () => {
  assert.throws(() => {
    protocolFromPort(1234);
  }, /Unknown port 1234/);
});
