"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTPTransport = void 0;
const encryption_js_1 = __importDefault(require("../encryption.js"));
const transport_js_1 = require("./transport.js");
const base64_js_1 = __importDefault(require("../utils/base64.js"));
const logger_js_1 = __importDefault(require("../utils/logger.js"));
const httpLogger = logger_js_1.default.child({
    name: 'http',
});
class HTTPTransport extends transport_js_1.Transport {
    url;
    constructor(options) {
        super(options);
        this.url = options.url;
        this.id = `${this.url}`;
        httpLogger.debug(`HTTPTransport initialized with URL: ${this.url}`);
    }
    async _send(options) {
        const { message, encryptionKey } = options;
        const requestLogger = logger_js_1.default.child({
            name: 'request',
            requestId: message.header?.messageId,
        });
        let body = JSON.stringify(message);
        let request = new Request(this.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                Accept: 'application/json',
            },
            body,
        });
        // Encrypt the message if encryptionKey is provided
        if (encryptionKey) {
            const data = Buffer.from(body, 'utf-8');
            const encryptedData = await encryption_js_1.default.encrypt(data, encryptionKey);
            body = await base64_js_1.default.encode(encryptedData);
            request = new Request(this.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                    Accept: 'text/plain',
                },
                body,
            });
        }
        requestLogger.http(`${request.method} ${request.url} ${JSON.stringify(request.headers)} ${await request.clone().text()}`, {
            request,
        });
        const response = await fetch(request);
        requestLogger.http(`${response.status} ${response.statusText} ${JSON.stringify(response.headers)} ${await response.clone().text()}`, {
            response,
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let responseBody;
        // Decrypt the response if encryptionKey is provided
        if (encryptionKey) {
            responseBody = await response.text();
            const data = base64_js_1.default.decode(responseBody);
            const decryptedData = await encryption_js_1.default.decrypt(data, encryptionKey);
            responseBody = decryptedData.toString('utf-8');
        }
        else {
            responseBody = await response.text();
        }
        if (!responseBody) {
            throw new Error('Empty response body');
        }
        const responseMessage = JSON.parse(responseBody);
        if (responseMessage.error) {
            throw new Error(`Error from server: ${responseMessage.error}`);
        }
        return responseMessage;
    }
}
exports.HTTPTransport = HTTPTransport;
