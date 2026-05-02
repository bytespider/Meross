import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { HTTPTransport } from './http.js';
import { Message } from '../message/message.js';

test('HTTPTransport should send a message without encryption', async () => {
  let capturedRequest: Request | null = null;
  const fetch = async (input: RequestInfo, init?: RequestInit) => {
    capturedRequest = new Request(input, init);
    return new Response(
      JSON.stringify({
        header: { method: 'GETACK' },
        payload: { all: { system: { hardware: {}, firmware: {} } } },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  };
  const transport = new HTTPTransport({ url: 'https://example.com', fetch });
  const message = new Message({
    payload: { test: 'message' },
  });
  const response = await transport.send({ message });

  assert.deepEqual(
    response.payload.all.system.hardware,
    {},
    'Should have parsed mock response',
  );
  assert(capturedRequest, 'Fetch was not called');
  assert.equal((capturedRequest as Request).method, 'POST');
  assert.equal(
    new URL((capturedRequest as Request).url).origin,
    'https://example.com',
    'URL origin should match',
  );
  assert.equal(
    (capturedRequest as Request).headers.get('Content-Type'),
    'application/json; charset=utf-8',
  );
});

test('HTTPTransport should handle an HTTP error response', async () => {
  const fetch = async () =>
    new Response(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });

  const transport = new HTTPTransport({ url: 'https://example.com', fetch });
  await assert.rejects(
    async () => {
      await transport['_send']({ message: { test: 'message' } });
    },
    { message: 'HTTP error! status: 500' },
  );
});

test('HTTPTransport should handle an empty response body', async () => {
  const fetch = async () =>
    new Response(null, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  const transport = new HTTPTransport({ url: 'https://example.com', fetch });
  await assert.rejects(
    async () => {
      await transport['_send']({ message: { test: 'message' } });
    },
    { message: 'Empty response body' },
  );
});

test('HTTPTransport should throw an error for server error messages', async () => {
  const fetch = async () =>
    new Response(JSON.stringify({ error: 'Server error' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  const transport = new HTTPTransport({ url: 'https://example.com', fetch });
  await assert.rejects(
    async () => {
      await transport['_send']({
        message: { test: 'message' },
      });
    },
    { message: 'Error from server: Server error' },
  );
});
