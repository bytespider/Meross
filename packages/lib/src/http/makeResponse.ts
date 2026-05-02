import { Response, Headers, BodyInit } from 'undici';

export function makeResponse(
  status: number,
  statusText: string,
  headers: Headers,
  body?: BodyInit | null,
): Response {
  return new Response(body, {
    status,
    statusText,
    headers,
  });
}
