import { Buffer } from 'buffer';
import { BinaryToTextEncoding, createHash } from 'crypto';

export function md5(data: string | Buffer): Buffer;
export function md5(
  data: string | Buffer,
  encoding: BinaryToTextEncoding
): string;
export function md5(
  data: string | Buffer,
  encoding?: BinaryToTextEncoding
): string | Buffer {
  if (typeof data === 'string') {
    data = Buffer.from(data, 'utf-8');
  }

  const hash = createHash('md5').update(data);
  if (encoding === undefined) {
    return hash.digest();
  }

  return hash.digest(encoding);
}

export default md5;
