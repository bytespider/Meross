import { Buffer } from 'buffer';
import { BinaryToTextEncoding } from 'crypto';
export declare function md5(data: string | Buffer): Buffer;
export declare function md5(data: string | Buffer, encoding: BinaryToTextEncoding): string;
export default md5;
