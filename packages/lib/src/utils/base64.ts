import { Buffer } from 'node:buffer';

export function encode(data: string | Buffer): string {
  if (typeof data === 'string') {
    data = Buffer.from(data, 'utf-8');
  }
  return data.toString('base64');
}

export function decode(data: string): Buffer {
  return Buffer.from(data, 'base64');
}

export default {
  encode,
  decode,
};
