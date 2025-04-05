import { Buffer } from 'node:buffer';
export declare function encode(data: string | Buffer): string;
export declare function decode(data: string): Buffer;
declare const _default: {
  encode: typeof encode;
  decode: typeof decode;
};
export default _default;
