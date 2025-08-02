import { createCipheriv, createDecipheriv, createECDH } from 'node:crypto';
import { Buffer } from 'node:buffer';
import {
  calculatePaddingForBlockSize,
  pad,
  trimPadding,
} from './utils/buffer.js';
import logger from './utils/logger.js';

const encryptionLogger = logger.child({
  name: 'encryption',
});

export const DEFAULT_IV = Buffer.from('0000000000000000', 'utf-8');

export type EncryptionKeyPair = {
  privateKey: Buffer;
  publicKey: Buffer;
};

export async function encrypt(
  data: Buffer,
  encryptionKey: Buffer,
  iv: Buffer<ArrayBufferLike> = DEFAULT_IV
): Promise<Buffer> {
  encryptionLogger.debug(
    `Encrypting: data: ${data.toString('utf-8')}, key: ${encryptionKey.toString(
      'base64'
    )}, iv: ${iv.toString('base64')}`
  );

  const cipher = createCipheriv('aes-256-cbc', encryptionKey, iv);

  // Disable auto padding to handle custom padding
  cipher.setAutoPadding(false);

  // Ensure the data length is a multiple of 16 by padding with null characters.
  const length = calculatePaddingForBlockSize(data, 16);
  const paddedData = pad(data, length, 0x0);

  // Encrypt the data
  return Buffer.concat([cipher.update(paddedData), cipher.final()]);
}

export async function decrypt(
  data: Buffer,
  encryptionKey: Buffer,
  iv: Buffer<ArrayBufferLike> = DEFAULT_IV
): Promise<Buffer> {
  encryptionLogger.debug(
    `Decrypting: data: ${data.toString(
      'base64'
    )}, key: ${encryptionKey.toString('base64')}, iv: ${iv.toString('base64')}`
  );
  const decipher = createDecipheriv('aes-256-cbc', encryptionKey, iv);

  // Disable auto padding to handle custom padding
  decipher.setAutoPadding(false);

  // Decrypt the data
  const decryptedData = Buffer.concat([
    decipher.update(data),
    decipher.final(),
  ]);

  // Remove padding
  const trimmedData = trimPadding(decryptedData, 0x0);
  encryptionLogger.debug(`Decrypted data: ${trimmedData.toString('utf-8')}`);

  return trimmedData;
}

export async function createKeyPair(
  privateKey: Buffer
): Promise<EncryptionKeyPair> {
  const ecdh = createECDH('prime256v1');
  ecdh.setPrivateKey(privateKey);

  const publicKey = ecdh.getPublicKey();

  encryptionLogger.debug(`Created key pair`, { publicKey });

  return {
    privateKey,
    publicKey,
  };
}

export async function generateKeyPair(): Promise<EncryptionKeyPair> {
  const ecdh = createECDH('prime256v1');
  ecdh.generateKeys();

  const publicKey = ecdh.getPublicKey();
  const privateKey = ecdh.getPrivateKey();

  encryptionLogger.debug(`Generated key pair`, { publicKey, privateKey });

  return {
    privateKey,
    publicKey,
  };
}

export async function deriveSharedKey(
  privateKey: Buffer,
  publicKey: Buffer
): Promise<Buffer> {
  const ecdh = createECDH('prime256v1');
  ecdh.setPrivateKey(privateKey);

  const sharedKey = ecdh.computeSecret(publicKey);

  encryptionLogger.debug(`Derived shared key: ${sharedKey.toString('base64')}`);

  return sharedKey;
}

export default {
  encrypt,
  decrypt,
  generateKeyPair,
  deriveSharedKey,
  DEFAULT_IV,
};
