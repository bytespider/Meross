"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigureECDHMessage = void 0;
const header_js_1 = require("./header.js");
const message_js_1 = require("./message.js");
class ConfigureECDHMessage extends message_js_1.Message {
    constructor(options) {
        const { payload = {}, header = {}, publicKey } = options;
        super({
            payload: {
                ecdhe: {
                    step: 1,
                    pubkey: publicKey.toString('base64'),
                },
                ...payload,
            },
            header: {
                method: header_js_1.Method.SET,
                namespace: header_js_1.Namespace.ENCRYPT_ECDHE,
                ...header,
            },
        });
    }
}
exports.ConfigureECDHMessage = ConfigureECDHMessage;
exports.default = ConfigureECDHMessage;
