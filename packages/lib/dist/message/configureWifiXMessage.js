"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigureWifiXMessage = void 0;
const configureWifiMessage_js_1 = require("./configureWifiMessage.js");
const header_js_1 = require("./header.js");
class ConfigureWifiXMessage extends configureWifiMessage_js_1.ConfigureWifiMessage {
    constructor(options) {
        const { wifiAccessPoint, payload, header } = options;
        super({
            wifiAccessPoint,
            header: {
                namespace: header_js_1.Namespace.CONFIG_WIFIX,
                ...header,
            },
            payload,
        });
    }
}
exports.ConfigureWifiXMessage = ConfigureWifiXMessage;
exports.default = ConfigureWifiXMessage;
