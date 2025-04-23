import { Buffer } from 'node:buffer';

export function calculatePaddingForBlockSize(data: Buffer, blockSize: number) {
  return blockSize - (data.length % blockSize);
}

export function pad(
  data: Buffer,
  length: number,
  fill?: string | Uint8Array | number
) {
  return Buffer.concat([data, Buffer.alloc(length, fill)]);
}

export function trimPadding(data: Buffer, fill?: string | Uint8Array | number) {
  if (data.length === 0) {
    return data;
  }

  fill = getFillByte(fill);

  let length = data.length;
  // starting from the end iterate backwards and check if the byte is equal to the fill
  while (length > 0 && data[length - 1] === fill) {
    length--;
  }

  return data.subarray(0, length);
}

function getFillByte(fill: string | number | Uint8Array<ArrayBufferLike>) {
  if (typeof fill === 'string') {
    fill = Buffer.from(fill, 'utf-8');
  } else if (fill instanceof Uint8Array) {
    fill = Buffer.from(fill);
  } else if (fill === undefined) {
    fill = 0;
  }
  // check if the fill is a buffer
  if (Buffer.isBuffer(fill)) {
    fill = fill[0];
  } else if (typeof fill === 'number') {
    fill = fill;
  }
  return fill;
}

export default {
  calculatePaddingForBlockSize,
  pad,
  trimPadding,
};
