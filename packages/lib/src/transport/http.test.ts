import { test, before } from 'node:test';
import assert from 'node:assert';
import { HTTPTransport } from './http';

test('HTTPTransport should send a message without encryption', async () => {
  before(() => {
    global.fetch = async (request) => {
      const { url, method, headers } = request;
      const body = await request.text();

      assert.strictEqual(url, 'https://example.com/');
      assert.strictEqual(method, 'POST');
      assert.strictEqual(
        headers.get('Content-Type'),
        'application/json; charset=utf-8'
      );
      assert.strictEqual(headers.get('Accept'), 'application/json');
      assert.strictEqual(body, JSON.stringify({ test: 'message' }));
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };
  });

  const transport = new HTTPTransport({ url: 'https://example.com' });
  const response = await transport['_send']({
    message: {
      test: 'message',
    },
  });
  assert.deepStrictEqual(response, { success: true });
});

test('HTTPTransport should handle an HTTP error response', async () => {
  before(() => {
    global.fetch = async () =>
      new Response(null, {
        status: 500,
        statusText: 'Internal Server Error',
      });
  });

  const transport = new HTTPTransport({ url: 'https://example.com' });
  await assert.rejects(
    async () => {
      await transport['_send']({ message: { test: 'message' } });
    },
    { message: 'HTTP error! status: 500' }
  );
});

test('HTTPTransport should handle an empty response body', async () => {
  before(() => {
    global.fetch = async () =>
      new Response(null, {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
  });

  const transport = new HTTPTransport({ url: 'https://example.com' });
  await assert.rejects(
    async () => {
      await transport['_send']({ message: { test: 'message' } });
    },
    { message: 'Empty response body' }
  );
});

test('HTTPTransport should throw an error for server error messages', async () => {
  before(() => {
    global.fetch = async () =>
      new Response(JSON.stringify({ error: 'Server error' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
  });

  const transport = new HTTPTransport({ url: 'https://example.com' });
  await assert.rejects(
    async () => {
      await transport['_send']({
        message: { test: 'message' },
      });
    },
    { message: 'Error from server: Server error' }
  );
});
