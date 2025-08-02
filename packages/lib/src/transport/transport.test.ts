import { test } from 'node:test';
import * as assert from 'node:assert';
import { Transport, MessageSendOptions } from './transport.js';
import { Message } from '../message/message.js';
import { ResponseMethod } from '../message/header.js';

class MockTransport extends Transport {
  async _send(options: any) {
    const { message } = options;
    return {
      header: {
        method: ResponseMethod[message.header.method],
      },
    };
  }
}

test('Transport should initialize with default timeout', () => {
  const transport = new MockTransport();
  assert.strictEqual(transport.timeout, 10000);
});

test('Transport should initialize with custom timeout', () => {
  const transport = new MockTransport({ timeout: 5000 });
  assert.strictEqual(transport.timeout, 5000);
});

test('Transport should throw error if message is not provided', async () => {
  const transport = new MockTransport();
  const options: MessageSendOptions = {
    message: null as unknown as Message,
  };

  await assert.rejects(async () => transport.send(options), {
    message: 'Message is required',
  });
});

test('Transport should set default messageId and timestamp if not provided', async () => {
  const transport = new MockTransport();
  const message = new Message();
  message.header.method = 'SomeMethod';

  assert.ok(message.header.messageId);
  assert.ok(message.header.timestamp);
});

test('Transport should use provided messageId and timestamp if available', async () => {
  const transport = new MockTransport();
  const message = new Message();
  message.header.method = 'SomeMethod';
  message.header.messageId = 'custom-id';
  message.header.timestamp = 'custom-timestamp';

  await transport.send({ message });

  assert.strictEqual(message.header.messageId, 'custom-id');
  assert.strictEqual(message.header.timestamp, 'custom-timestamp');
});

test('Transport should set the "from" field in the message header', async () => {
  const transport = new MockTransport();
  transport.id = 'transport-id';
  const message = new Message();
  message.header.method = 'SomeMethod';

  await transport.send({ message });

  assert.strictEqual(message.header.from, 'transport-id');
});

test('Transport should throw error if response method does not match expected method', async () => {
  class InvalidResponseTransport extends Transport {
    async _send(options: any) {
      return {
        header: {
          method: 'InvalidMethod',
        },
      };
    }
  }

  const transport = new InvalidResponseTransport();
  const message = new Message();
  message.header.method = 'SomeMethod';

  await assert.rejects(async () => transport.send({ message }), {
    message: 'Response was not undefined',
  });
});

test('Transport should return the response if everything is valid', async () => {
  const transport = new MockTransport();
  const message = new Message();
  message.header.method = 'SomeMethod';

  const response = await transport.send({ message });

  assert.ok(response);
  assert.strictEqual(
    response.header.method,
    ResponseMethod[message.header.method]
  );
});
