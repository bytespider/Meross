"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigureDeviceTimeMessage = void 0;
const generateTimestamp_js_1 = require("../utils/generateTimestamp.js");
const header_js_1 = require("./header.js");
const message_js_1 = require("./message.js");
class ConfigureDeviceTimeMessage extends message_js_1.Message {
    constructor(options = {
        timestamp: (0, generateTimestamp_js_1.generateTimestamp)(),
        timezone: 'Etc/UTC',
    }) {
        const { header, payload, timestamp, timezone } = options;
        super({
            header: {
                method: header_js_1.Method.SET,
                namespace: header_js_1.Namespace.SYSTEM_TIME,
                ...header,
            },
            payload: {
                time: {
                    timezone,
                    timestamp,
                },
                ...payload,
            },
        });
    }
}
exports.ConfigureDeviceTimeMessage = ConfigureDeviceTimeMessage;
exports.default = ConfigureDeviceTimeMessage;
