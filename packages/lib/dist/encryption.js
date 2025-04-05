"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_IV = void 0;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.createKeyPair = createKeyPair;
exports.generateKeyPair = generateKeyPair;
exports.deriveSharedKey = deriveSharedKey;
const node_crypto_1 = require("node:crypto");
const node_buffer_1 = require("node:buffer");
const buffer_1 = require("./utils/buffer");
const logger_1 = __importDefault(require("./utils/logger"));
const encryptionLogger = logger_1.default.child({
    name: 'encryption',
});
exports.DEFAULT_IV = node_buffer_1.Buffer.from('0000000000000000', 'utf-8');
async function encrypt(data, encryptionKey, iv = exports.DEFAULT_IV) {
    encryptionLogger.debug(`Encrypting: data: ${data.toString('utf-8')}, key: ${encryptionKey.toString('base64')}, iv: ${iv.toString('base64')}`);
    const cipher = (0, node_crypto_1.createCipheriv)('aes-256-cbc', encryptionKey, iv);
    // Disable auto padding to handle custom padding
    cipher.setAutoPadding(false);
    // Ensure the data length is a multiple of 16 by padding with null characters.
    const length = (0, buffer_1.calculatePaddingForBlockSize)(data, 16);
    const paddedData = (0, buffer_1.pad)(data, length, 0x0);
    // Encrypt the data
    return node_buffer_1.Buffer.concat([cipher.update(paddedData), cipher.final()]);
}
async function decrypt(data, encryptionKey, iv = exports.DEFAULT_IV) {
    encryptionLogger.debug(`Decrypting: data: ${data.toString('base64')}, key: ${encryptionKey.toString('base64')}, iv: ${iv.toString('base64')}`);
    const decipher = (0, node_crypto_1.createDecipheriv)('aes-256-cbc', encryptionKey, iv);
    // Disable auto padding to handle custom padding
    decipher.setAutoPadding(false);
    // Decrypt the data
    const decryptedData = node_buffer_1.Buffer.concat([
        decipher.update(data),
        decipher.final(),
    ]);
    // Remove padding
    const trimmedData = (0, buffer_1.trimPadding)(decryptedData, 0x0);
    encryptionLogger.debug(`Decrypted data: ${trimmedData.toString('utf-8')}`);
    return trimmedData;
}
async function createKeyPair(privateKey) {
    const ecdh = (0, node_crypto_1.createECDH)('prime256v1');
    ecdh.setPrivateKey(privateKey);
    const publicKey = ecdh.getPublicKey();
    encryptionLogger.debug(`Created key pair`, { publicKey });
    return {
        privateKey,
        publicKey,
    };
}
async function generateKeyPair() {
    const ecdh = (0, node_crypto_1.createECDH)('prime256v1');
    ecdh.generateKeys();
    const publicKey = ecdh.getPublicKey();
    const privateKey = ecdh.getPrivateKey();
    encryptionLogger.debug(`Generated key pair`, { publicKey, privateKey });
    return {
        privateKey,
        publicKey,
    };
}
async function deriveSharedKey(privateKey, publicKey) {
    const ecdh = (0, node_crypto_1.createECDH)('prime256v1');
    ecdh.setPrivateKey(privateKey);
    const sharedKey = ecdh.computeSecret(publicKey);
    encryptionLogger.debug(`Derived shared key: ${sharedKey.toString('base64')}`);
    return sharedKey;
}
exports.default = {
    encrypt,
    decrypt,
    generateKeyPair,
    deriveSharedKey,
    DEFAULT_IV: exports.DEFAULT_IV,
};
