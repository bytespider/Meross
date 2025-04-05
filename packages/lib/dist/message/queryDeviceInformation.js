"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryDeviceInformationMessage = void 0;
const header_js_1 = require("./header.js");
const message_js_1 = require("./message.js");
class QueryDeviceInformationMessage extends message_js_1.Message {
    constructor(options = {}) {
        const { payload = {}, header = {} } = options;
        super({
            payload,
            header: {
                method: header_js_1.Method.GET,
                namespace: header_js_1.Namespace.SYSTEM_ALL,
                ...header,
            },
        });
    }
}
exports.QueryDeviceInformationMessage = QueryDeviceInformationMessage;
exports.default = QueryDeviceInformationMessage;
