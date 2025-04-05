"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transport = exports.TransportSendOptions = exports.DEFAULT_TIMEOUT = void 0;
const header_js_1 = require("../message/header.js");
const index_js_1 = require("../utils/index.js");
const logger_js_1 = __importDefault(require("../utils/logger.js"));
const transportLogger = logger_js_1.default.child({
    name: 'transport',
});
exports.DEFAULT_TIMEOUT = 10_000;
class TransportSendOptions {
    message = {};
    encryptionKey;
}
exports.TransportSendOptions = TransportSendOptions;
class Transport {
    id = `transport/${(0, index_js_1.randomId)()}`;
    timeout;
    credentials;
    constructor(options = {}) {
        this.timeout = options.timeout || exports.DEFAULT_TIMEOUT;
        this.credentials = options.credentials;
        transportLogger.debug(`Transport initialized. Credentials: ${JSON.stringify(this.credentials)}`);
    }
    async send(options) {
        const { message, encryptionKey } = options;
        if (!message) {
            throw new Error('Message is required');
        }
        message.header.from = this.id;
        if (!message.header.messageId) {
            message.header.messageId = (0, index_js_1.randomId)();
        }
        if (!message.header.timestamp) {
            message.header.timestamp = (0, index_js_1.generateTimestamp)();
        }
        logger_js_1.default.debug(`Signing message ${message.header.messageId}`);
        message.sign(this.credentials?.key);
        const response = await this._send({
            message,
            encryptionKey,
        });
        const { header } = response;
        const expectedResponseMethod = header_js_1.ResponseMethodLookup[message.header.method];
        if (header.method !== expectedResponseMethod) {
            throw new Error(`Response was not ${expectedResponseMethod}`);
        }
        return response;
    }
}
exports.Transport = Transport;
