import { Buffer } from 'node:buffer';
export declare function calculatePaddingForBlockSize(
  data: Buffer,
  blockSize: number
): number;
export declare function pad(
  data: Buffer,
  length: number,
  fill?: string | Uint8Array | number
): Buffer<ArrayBuffer>;
export declare function trimPadding(
  data: Buffer,
  fill?: string | Uint8Array | number
): Buffer<ArrayBufferLike>;
declare const _default: {
  calculatePaddingForBlockSize: typeof calculatePaddingForBlockSize;
  pad: typeof pad;
  trimPadding: typeof trimPadding;
};
export default _default;
