import { Headers } from 'undici';

export function normalizeHeaders(headerLines: string[]): Headers {
  const headers = new Headers();
  for (const line of headerLines) {
    const [name, ...rest] = line.split(':');
    const value = rest.join(':').trim();

    // RFC-compliant token validation
    if (!/^[!#$%&'*+\-.^_`|~0-9a-z]+$/i.test(name)) {
      throw new Error(`Invalid header name: ${name}`);
    }

    if (headers.has(name.trim())) {
      headers.append(name.trim(), value);
    } else {
      headers.set(name.trim(), value);
    }
  }
  return headers;
}
