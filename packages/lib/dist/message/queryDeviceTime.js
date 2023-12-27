"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryDeviceTimeMessage = void 0;
const header_1 = require("./header");
const message_1 = require("./message");
class QueryDeviceTimeMessage extends message_1.Message {
    constructor(options = {}) {
        const { payload = {}, header = {} } = options;
        super({
            payload,
            header: {
                method: header_1.Method.GET,
                namespace: header_1.Namespace.SYSTEM_TIME,
                ...header,
            },
        });
    }
}
exports.QueryDeviceTimeMessage = QueryDeviceTimeMessage;
exports.default = QueryDeviceTimeMessage;
