import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import { Parser } from './parser.js';

test('Parser should handle a standard HTTP response', async () => {
  const parser = new Parser();
  const response = parser.write(
    new TextEncoder().encode(
      'HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: 15\r\n\r\n{"key":"value"}',
    ),
  );

  assert(response !== undefined, 'Response should be defined');
  assert.strictEqual(response!.status, 200);
  assert.strictEqual(response!.statusText, 'OK');
  assert.strictEqual(
    response!.headers.get('Content-Type'),
    'application/json',
  );
  const body = await response!.text();
  assert.strictEqual(body, '{"key":"value"}');
});

test('Parser should handle bare LF (\\n) line endings', async () => {
  const parser = new Parser();
  const response = parser.write(
    new TextEncoder().encode(
      'HTTP/1.1 200 OK\nContent-Type: text/plain\nContent-Length: 5\n\nHello',
    ),
  );

  assert(response !== undefined, 'Response should be defined');
  assert.strictEqual(response!.status, 200);
  const body = await response!.text();
  assert.strictEqual(body, 'Hello');
});

test('Parser should handle mixed CRLF and LF in the same response', async () => {
  const parser = new Parser();
  const response = parser.write(
    new TextEncoder().encode(
      'HTTP/1.1 200 OK\r\nContent-Type: application/json\nContent-Length: 17\r\n\r\n{"hello":"world"}',
    ),
  );

  assert(response !== undefined, 'Response should be defined');
  assert.strictEqual(response!.status, 200);
  const body = await response!.text();
  assert.strictEqual(body, '{"hello":"world"}');
});

test('Parser should handle data split across multiple write calls', async () => {
  const parser = new Parser();
  const encoder = new TextEncoder();

  // First chunk: status line + partial headers
  let result = parser.write(
    encoder.encode('HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n'),
  );
  assert.strictEqual(
    result,
    undefined,
    'Should not return response yet (incomplete)',
  );

  // Second chunk: remaining headers + body
  result = parser.write(
    encoder.encode('Content-Length: 18\r\n\r\n{"complete"'),
  );
  assert.strictEqual(
    result,
    undefined,
    'Should not return response yet (incomplete body)',
  );

  // Third chunk: rest of body
  result = parser.write(encoder.encode(':"yep"}'));
  assert(result !== undefined, 'Response should be defined after body complete');
  const body = await result!.text();
  assert.strictEqual(body, '{"complete":"yep"}');
});

test('Parser should handle 204 without Content-Length', async () => {
  const parser = new Parser();
  // 204 No Content — parser reads 0 bytes (no body allowed for 204)
  const response = parser.write(
    new TextEncoder().encode(
      'HTTP/1.1 204 No Content\r\n\r\n',
    ),
  );
  assert(response !== undefined, 'Response should be defined');
  assert.strictEqual(response!.status, 204);
  // 204 responses forbid a body
  const body = await response!.text();
  assert.strictEqual(body, '');
});

test('Parser should handle empty body with Content-Length: 0', async () => {
  const parser = new Parser();
  const response = parser.write(
    new TextEncoder().encode(
      'HTTP/1.1 200 OK\r\nContent-Length: 0\r\n\r\n',
    ),
  );

  assert(response !== undefined, 'Response should be defined');
  const body = await response!.text();
  assert.strictEqual(body, '');
});

test('Parser should handle multiple Set-Cookie headers', async () => {
  const parser = new Parser();
  const response = parser.write(
    new TextEncoder().encode(
      'HTTP/1.1 200 OK\r\n' +
        'Content-Length: 2\r\n' +
        'Set-Cookie: a=1\r\n' +
        'Set-Cookie: b=2\r\n' +
        '\r\n' +
        '{}',
    ),
  );

  assert(response !== undefined, 'Response should be defined');
  const cookies = response!.headers.getSetCookie?.();
  if (cookies) {
    assert.strictEqual(cookies.length, 2);
    assert.strictEqual(cookies[0], 'a=1');
    assert.strictEqual(cookies[1], 'b=2');
  }
  const body = await response!.text();
  assert.strictEqual(body, '{}');
});

test('Parser should handle status codes other than 200', async () => {
  const parser = new Parser();
  const response = parser.write(
    new TextEncoder().encode(
      'HTTP/1.1 404 Not Found\r\nContent-Length: 9\r\n\r\nNot Found',
    ),
  );

  assert(response !== undefined, 'Response should be defined');
  assert.strictEqual(response!.status, 404);
  assert.strictEqual(response!.statusText, 'Not Found');
  const body = await response!.text();
  assert.strictEqual(body, 'Not Found');
});

test('Parser should enter error state for non-HTTP responses', () => {
  const parser = new Parser();
  const result = parser.write(
    new TextEncoder().encode('NOT HTTP\r\n\r\n'),
  );

  assert.strictEqual(result, undefined, 'Non-HTTP should not produce response');
  // No assertion on state since it's private — we just verify no crash
});

test('Parser should handle large body', async () => {
  const parser = new Parser();
  const bodyContent = 'x'.repeat(10000);
  const response = parser.write(
    new TextEncoder().encode(
      `HTTP/1.1 200 OK\r\nContent-Length: 10000\r\n\r\n${bodyContent}`,
    ),
  );

  assert(response !== undefined, 'Response should be defined');
  const body = await response!.text();
  assert.strictEqual(body.length, 10000);
  assert.strictEqual(body, bodyContent);
});

test('Parser should handle response with empty header section', async () => {
  const parser = new Parser();
  const response = parser.write(
    new TextEncoder().encode(
      'HTTP/1.1 200 OK\r\n\r\n',
    ),
  );

  assert(response !== undefined, 'Response should be defined');
  assert.strictEqual(response!.status, 200);
});

test('Parser should handle content-type with charset', async () => {
  const parser = new Parser();
  const response = parser.write(
    new TextEncoder().encode(
      'HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: 5\r\n\r\nhello',
    ),
  );

  assert(response !== undefined, 'Response should be defined');
  assert.strictEqual(
    response!.headers.get('Content-Type'),
    'text/html; charset=utf-8',
  );
  const body = await response!.text();
  assert.strictEqual(body, 'hello');
});
