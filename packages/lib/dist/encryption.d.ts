import { Buffer } from 'node:buffer';
export declare const DEFAULT_IV: Buffer<ArrayBuffer>;
export type EncryptionKeyPair = {
    privateKey: Buffer;
    publicKey: Buffer;
};
export declare function encrypt(data: Buffer, encryptionKey: Buffer, iv?: Buffer<ArrayBufferLike>): Promise<Buffer>;
export declare function decrypt(data: Buffer, encryptionKey: Buffer, iv?: Buffer<ArrayBufferLike>): Promise<Buffer>;
export declare function createKeyPair(privateKey: Buffer): Promise<EncryptionKeyPair>;
export declare function generateKeyPair(): Promise<EncryptionKeyPair>;
export declare function deriveSharedKey(privateKey: Buffer, publicKey: Buffer): Promise<Buffer>;
declare const _default: {
    encrypt: typeof encrypt;
    decrypt: typeof decrypt;
    generateKeyPair: typeof generateKeyPair;
    deriveSharedKey: typeof deriveSharedKey;
    DEFAULT_IV: Buffer<ArrayBuffer>;
};
export default _default;
